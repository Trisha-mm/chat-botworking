import React, { useState, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { usePathname } from 'expo-router';

const LEGISCAN_API_KEY = 'e6f93acb79190e73c1658d56bfed1798';
const BASE_URL = 'https://api.legiscan.com/';

const CATEGORIES: { label: string; keywords: string[] }[] = [
  { label: 'All', keywords: [] },
  { label: 'Education', keywords: ['education', 'school', 'student', 'teacher', 'university', 'college', 'curriculum', 'classroom'] },
  { label: 'Health', keywords: ['health', 'medical', 'hospital', 'medicaid', 'medicare', 'mental health', 'drug', 'pharmacy', 'vaccine', 'insurance'] },
  { label: 'Public Safety', keywords: ['police', 'crime', 'criminal', 'firearm', 'gun', 'law enforcement', 'jail', 'prison', 'safety', 'emergency'] },
  { label: 'Tax & Finance', keywords: ['tax', 'budget', 'appropriation', 'revenue', 'fiscal', 'finance', 'fund', 'grant', 'fee'] },
  { label: 'Environment', keywords: ['environment', 'climate', 'energy', 'water', 'air quality', 'conservation', 'wildlife', 'pollution', 'solar', 'renewable'] },
  { label: 'Transportation', keywords: ['transportation', 'highway', 'road', 'transit', 'vehicle', 'traffic', 'aviation', 'rail', 'bridge'] },
  { label: 'Housing', keywords: ['housing', 'rent', 'landlord', 'tenant', 'zoning', 'property', 'mortgage', 'homeless'] },
  { label: 'Economy', keywords: ['business', 'economy', 'employment', 'labor', 'wage', 'worker', 'unemployment', 'commerce', 'trade'] },
  { label: 'Civil Rights', keywords: ['civil rights', 'discrimination', 'equality', 'voting', 'election', 'immigration', 'refugee', 'disability'] },
];

const STATUS_FILTERS = [
  { label: 'All', value: 0 },
  { label: 'Introduced', value: 1 },
  { label: 'Engrossed', value: 2 },
  { label: 'Enrolled', value: 3 },
  { label: 'Passed', value: 4 },
  { label: 'Vetoed', value: 5 },
  { label: 'Failed', value: 6 },
];

interface Bill {
  bill_id: number;
  bill_number: string;
  title: string;
  last_action: string;
  last_action_date: string;
  status: number;
  url?: string;
}

interface BillText {
  doc_id: number;
  date: string;
  type_id: number;
  type: string;
  mime: string;
  state_link?: string;
  url?: string;
}

interface BillDetail extends Bill {
  description: string;
  status_desc: string;
  sponsors: { name: string; party: string }[];
  history: { action: string; date: string }[];
  texts?: BillText[];
}

const STATUS_LABELS: Record<number, string> = {
  1: 'Introduced',
  2: 'Engrossed',
  3: 'Enrolled',
  4: 'Passed',
  5: 'Vetoed',
  6: 'Failed',
};

const STATUS_COLORS: Record<number, string> = {
  1: '#B091A4',
  2: '#F5908E',
  3: '#E08A88',
  4: '#4CAF50',
  5: '#FF5722',
  6: '#9E9E9E',
};

const PAGE_SIZE = 30;

function matchesCategory(bill: Bill, category: string): boolean {
  if (category === 'All') return true;
  const cat = CATEGORIES.find((c) => c.label === category);
  if (!cat) return true;
  const text = (bill.title + ' ' + bill.last_action).toLowerCase();
  return cat.keywords.some((kw) => text.includes(kw));
}

function localSearch(bills: Bill[], query: string): Bill[] {
  const q = query.toLowerCase().trim();
  if (!q) return bills;
  return bills.filter(
    (b) =>
      b.title?.toLowerCase().includes(q) ||
      b.bill_number?.toLowerCase().includes(q) ||
      b.last_action?.toLowerCase().includes(q)
  );
}

function applyFilters(bills: Bill[], category: string, status: number): Bill[] {
  let result = bills;
  if (category !== 'All') {
    result = result.filter((b) => matchesCategory(b, category));
  }
  if (status !== 0) {
    result = result.filter((b) => b.status === status);
  }
  return result;
}

async function getSessionId(stateCode: string): Promise<number> {
  const res = await fetch(
    `${BASE_URL}?key=${LEGISCAN_API_KEY}&op=getSessionList&state=${stateCode}`
  );
  const data = await res.json();
  if (!data.sessions?.length) throw new Error('No sessions found for ' + stateCode);
  return data.sessions[0].session_id;
}

async function fetchBills(stateCode: string): Promise<Bill[]> {
  const sessionId = await getSessionId(stateCode);
  const res = await fetch(
    `${BASE_URL}?key=${LEGISCAN_API_KEY}&op=getMasterList&id=${sessionId}`
  );
  const data = await res.json();
  if (!data.masterlist) throw new Error('No bill data returned');
  return (Object.values(data.masterlist) as any[])
    .filter((b: any) => b.bill_id)
    .sort((a: any, b: any) =>
      new Date(b.last_action_date).getTime() - new Date(a.last_action_date).getTime()
    );
}

async function fetchBillDetail(billId: number): Promise<BillDetail> {
  const res = await fetch(
    `${BASE_URL}?key=${LEGISCAN_API_KEY}&op=getBill&id=${billId}`
  );
  const data = await res.json();
  return data.bill;
}

async function openBillText(docId: number): Promise<void> {
  const res = await fetch(
    `${BASE_URL}?key=${LEGISCAN_API_KEY}&op=getBillText&id=${docId}`
  );
  const data = await res.json();
  const link = data.text?.state_link ?? data.text?.url ?? '';
  if (link) {
    Linking.openURL(link);
  } else {
    Alert.alert('Unavailable', 'No document link available for this bill version.');
  }
}

export default function BillsScreen() {
  const [selectedState, setSelectedState] = useState({ code: 'GA', name: 'Georgia' });
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeStatus, setActiveStatus] = useState(0);
  const [selectedBill, setSelectedBill] = useState<BillDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [openingDoc, setOpeningDoc] = useState<number | null>(null);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/journal' || pathname.includes('journal')) {
      AsyncStorage.getItem('selectedState').then((val) => {
        const state = val
          ? JSON.parse(val)
          : { code: 'GA', name: 'Georgia' };
  
        setSelectedState(state);
        loadBills(state.code);
      });
    }
  }, [pathname]);

  const isSearching = query.trim().length > 0;

  const allFiltered = isSearching
    ? localSearch(allBills, query)
    : applyFilters(allBills, activeCategory, activeStatus);

  const filteredBills = allFiltered.slice(0, page * PAGE_SIZE);
  const showLoadMore = !isSearching && filteredBills.length < allFiltered.length;

  const loadBills = async (stateCode: string) => {
    setLoading(true);
    setQuery('');
    setSelectedBill(null);
    setActiveCategory('All');
    setActiveStatus(0);
    setPage(1);
    try {
      const data = await fetchBills(stateCode);
      setAllBills(data);
    } catch (e: any) {
      Alert.alert('Failed to Load Bills', e.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage((p) => p + 1);
  };

  const handleClearFilters = () => {
    setQuery('');
    setActiveCategory('All');
    setActiveStatus(0);
    setPage(1);
  };

  const handleSelectBill = async (billId: number) => {
    setDetailLoading(true);
    try {
      const detail = await fetchBillDetail(billId);
      setSelectedBill(detail);
    } catch (e: any) {
      Alert.alert('Error', `Could not load bill details: ${e.message}`);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenDoc = async (docId: number) => {
    setOpeningDoc(docId);
    try {
      await openBillText(docId);
    } catch {
      Alert.alert('Error', 'Could not open document.');
    } finally {
      setOpeningDoc(null);
    }
  };

  const getStatusColor = (status: number) => STATUS_COLORS[status] ?? '#B091A4';
  const getStatusLabel = (status: number) => STATUS_LABELS[status] ?? 'In Progress';

  const renderBillCard = ({ item: bill }: { item: Bill }) => (
    <TouchableOpacity
      style={styles.billCard}
      onPress={() => handleSelectBill(bill.bill_id)}
    >
      <View style={styles.billCardTop}>
        <Text style={styles.billNumber}>{bill.bill_number}</Text>
        <View style={[styles.statusPill, { backgroundColor: getStatusColor(bill.status) + '22' }]}>
          <Text style={[styles.statusPillText, { color: getStatusColor(bill.status) }]}>
            {getStatusLabel(bill.status)}
          </Text>
        </View>
      </View>
      <Text style={styles.billTitle} numberOfLines={4}>
        {bill.title || 'No title available'}
      </Text>
      {bill.last_action_date ? (
        <Text style={styles.billDate}>{bill.last_action_date}</Text>
      ) : null}
    </TouchableOpacity>
  );

  // ── Detail loading ────────────────────────────────────────
  if (detailLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Loading...</Text>
        </View>
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#F5908E" size="large" />
          <Text style={styles.loadingText}>Fetching bill details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Detail view ───────────────────────────────────────────
  if (selectedBill) {
    const statusColor = getStatusColor(selectedBill.status);
    const statusLabel = getStatusLabel(selectedBill.status);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setSelectedBill(null)}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
            <Text style={styles.backBtnText}>Bills</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{selectedBill.bill_number}</Text>
          <View style={{ width: 70 }} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        >
          {/* Title + status */}
          <View style={styles.section}>
            <View style={styles.detailTitleCard}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusBadgeText}>{statusLabel}</Text>
              </View>
              <Text style={styles.detailTitle}>{selectedBill.title}</Text>
              {selectedBill.last_action_date ? (
                <Text style={styles.detailDate}>{selectedBill.last_action_date}</Text>
              ) : null}
            </View>
          </View>

          {/* Sponsors */}
          {selectedBill.sponsors?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sponsors</Text>
              <View style={styles.infoCard}>
                {selectedBill.sponsors.map((s, i) => (
                  <View key={i}>
                    {i > 0 && <View style={styles.divider} />}
                    <View style={styles.sponsorRow}>
                      <Text style={styles.sponsorName}>{s.name}</Text>
                      {s.party ? (
                        <View style={styles.partyBadge}>
                          <Text style={styles.partyBadgeText}>{s.party}</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* History */}
          {selectedBill.history?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>History</Text>
              <View style={styles.infoCard}>
                {selectedBill.history.map((h, i) => (
                  <View key={i}>
                    {i > 0 && <View style={styles.divider} />}
                    {h.date ? (
                      <Text style={styles.historyDate}>{h.date}</Text>
                    ) : null}
                    <Text style={styles.historyAction}>{h.action}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Bill Documents */}
          {selectedBill.texts && selectedBill.texts.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bill Documents</Text>
              <View style={styles.infoCard}>
                {selectedBill.texts.map((t, i) => (
                  <View key={t.doc_id}>
                    {i > 0 && <View style={styles.divider} />}
                    <View style={styles.docRow}>
                      <Text style={styles.docType}>{t.type}</Text>
                      <TouchableOpacity
                        style={styles.readBtn}
                        onPress={() => handleOpenDoc(t.doc_id)}
                        disabled={openingDoc === t.doc_id}
                      >
                        {openingDoc === t.doc_id
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <Text style={styles.readBtnText}>Read</Text>
                        }
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
              <Text style={styles.docNote}>Documents open as official state PDFs</Text>
            </View>
          )}

          {selectedBill.url ? (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.fullBillBtn}
                onPress={() => Linking.openURL(selectedBill.url!)}
              >
                <Text style={styles.fullBillBtnText}>View on Official State Site</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.attribution}>
            <Text style={styles.attributionText}>
              Data by{' '}
              <Text style={styles.attributionLink} onPress={() => Linking.openURL('https://legiscan.com')}>LegiScan</Text>
              {' '}·{' '}
              <Text style={styles.attributionLink} onPress={() => Linking.openURL('https://creativecommons.org/licenses/by/4.0/')}>CC BY 4.0</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── List view ─────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{selectedState.name}</Text>
        <Text style={styles.headerSubtitle}>2025–2026 Legislative Session</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator color="#F5908E" size="large" />
          <Text style={styles.loadingText}>Loading {selectedState.name} bills...</Text>
          <Text style={styles.loadingSubText}>This may take a few seconds</Text>
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => String(item.bill_id)}
          renderItem={renderBillCard}
          contentContainerStyle={{ paddingBottom: 20, paddingTop: 8 }}
          ListHeaderComponent={
            <View>
              {/* Stats */}
              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statCount}>{allBills.length}</Text>
                  <Text style={styles.statLabel}>Total Bills</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCount}>{selectedState.code}</Text>
                  <Text style={styles.statLabel}>State</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCount}>{allFiltered.length}</Text>
                  <Text style={styles.statLabel}>Matching</Text>
                </View>
              </View>

              {/* Search */}
              <View style={styles.section}>
                <View style={styles.searchWrapper}>
                  <Ionicons name="search-outline" size={18} color="#B091A4" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search by title, bill number, or action..."
                    placeholderTextColor="#B091A4"
                    value={query}
                    onChangeText={(t) => { setQuery(t); setPage(1); }}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                  />
                  {query.length > 0 && (
                    <TouchableOpacity onPress={handleClearFilters}>
                      <Ionicons name="close-circle" size={18} color="#B091A4" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Filters — hidden while searching */}
              {!isSearching && (
                <>
                  <View style={styles.section}>
                    <Text style={styles.filterLabel}>Filter by Status</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipsRow}
                    >
                      {STATUS_FILTERS.map((sf) => {
                        const color = sf.value === 0 ? '#F5908E' : STATUS_COLORS[sf.value];
                        const isActive = activeStatus === sf.value;
                        return (
                          <TouchableOpacity
                            key={sf.label}
                            style={[styles.chip, isActive && { backgroundColor: color, borderColor: color }]}
                            onPress={() => { setActiveStatus(sf.value); setPage(1); }}
                          >
                            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                              {sf.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  <View style={styles.section}>
                    <Text style={styles.filterLabel}>Filter by Category</Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chipsRow}
                    >
                      {CATEGORIES.map((cat) => (
                        <TouchableOpacity
                          key={cat.label}
                          style={[styles.chip, activeCategory === cat.label && styles.chipActive]}
                          onPress={() => { setActiveCategory(cat.label); setPage(1); }}
                        >
                          <Text style={[styles.chipText, activeCategory === cat.label && styles.chipTextActive]}>
                            {cat.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </>
              )}

              <View style={styles.section}>
                <Text style={styles.resultsLabel}>
                  {isSearching
                    ? `${allFiltered.length} result${allFiltered.length !== 1 ? 's' : ''} for "${query}"`
                    : activeStatus !== 0
                      ? `${getStatusLabel(activeStatus)} Bills${activeCategory !== 'All' ? ` · ${activeCategory}` : ''}`
                      : activeCategory !== 'All'
                        ? `${activeCategory} Bills`
                        : 'Recent Bills'}
                </Text>
              </View>
            </View>
          }
          ListFooterComponent={
            <View>
              {showLoadMore && (
                <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore}>
                  <Text style={styles.loadMoreText}>
                    Load More ({allFiltered.length - filteredBills.length} remaining)
                  </Text>
                </TouchableOpacity>
              )}
              <View style={styles.attribution}>
                <Text style={styles.attributionText}>
                  Data by{' '}
                  <Text style={styles.attributionLink} onPress={() => Linking.openURL('https://legiscan.com')}>LegiScan</Text>
                  {' '}·{' '}
                  <Text style={styles.attributionLink} onPress={() => Linking.openURL('https://creativecommons.org/licenses/by/4.0/')}>CC BY 4.0</Text>
                </Text>
              </View>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.noDataText}>
                {isSearching
                  ? `No bills found matching "${query}"`
                  : activeStatus !== 0 && activeCategory !== 'All'
                    ? `No ${getStatusLabel(activeStatus)} bills in ${activeCategory}.`
                    : activeStatus !== 0
                      ? `No ${getStatusLabel(activeStatus)} bills found.`
                      : activeCategory !== 'All'
                        ? `No ${activeCategory} bills found.`
                        : 'No bills found.'}
              </Text>
              {(isSearching || activeStatus !== 0 || activeCategory !== 'All') && (
                <TouchableOpacity style={styles.clearSearchBtn} onPress={handleClearFilters}>
                  <Text style={styles.clearSearchBtnText}>Clear Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContainer: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyContainer: { alignItems: 'center', padding: 40 },
  header: {
    backgroundColor: '#F5908E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E08A88',
    elevation: 2,
    alignItems: 'center',
  },
  backBtn: {
    position: 'absolute', left: 16, top: 16,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20,
  },
  backBtnText: { color: '#fff', fontSize: 14, marginLeft: 4, fontWeight: '600' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  headerSubtitle: { fontSize: 13, color: '#FFFFFF', opacity: 0.9, marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, gap: 10 },
  statCard: {
    flex: 1, backgroundColor: '#F8F4F4', borderRadius: 12,
    padding: 12, alignItems: 'center', borderWidth: 1, borderColor: '#F5D4D4',
  },
  statCount: { fontSize: 16, fontWeight: '700', color: '#2D2D2D' },
  statLabel: { fontSize: 10, color: '#B091A4', marginTop: 2, textAlign: 'center' },
  section: { paddingHorizontal: 16, marginBottom: 12 },
  filterLabel: { fontSize: 12, fontWeight: '700', color: '#B091A4', textTransform: 'uppercase', marginBottom: 8 },
  resultsLabel: { fontSize: 15, fontWeight: '700', color: '#2D2D2D' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F8F4F4', borderRadius: 24, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#F5D4D4', height: 48,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#2D2D2D' },
  chipsRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
    borderColor: '#F5D4D4', backgroundColor: '#F8F4F4',
  },
  chipActive: { backgroundColor: '#F5908E', borderColor: '#F5908E' },
  chipText: { fontSize: 13, color: '#B091A4', fontWeight: '600' },
  chipTextActive: { color: '#fff' },
  loadingText: { color: '#B091A4', marginTop: 12, fontSize: 14, textAlign: 'center' },
  loadingSubText: { color: '#D4C4C4', marginTop: 6, fontSize: 12 },
  noDataText: {
    textAlign: 'center', color: '#6B5B5B', fontSize: 15,
    fontStyle: 'italic', paddingVertical: 16, paddingHorizontal: 20,
  },
  clearSearchBtn: {
    marginTop: 12, backgroundColor: '#F5908E',
    borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10,
  },
  clearSearchBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  billCard: {
    backgroundColor: '#F8F4F4', borderRadius: 14, padding: 16,
    marginHorizontal: 16, marginBottom: 10, borderWidth: 1, borderColor: '#F5D4D4',
  },
  billCardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 8,
  },
  billNumber: { fontSize: 13, fontWeight: '700', color: '#F5908E' },
  statusPill: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  statusPillText: { fontSize: 11, fontWeight: '600' },
  billTitle: { fontSize: 16, fontWeight: '600', color: '#2D2D2D', lineHeight: 22, marginBottom: 6 },
  billDate: { fontSize: 12, color: '#B091A4', fontWeight: '600' },
  loadMoreBtn: {
    marginHorizontal: 16, marginVertical: 12, padding: 14,
    backgroundColor: '#F8F4F4', borderRadius: 12,
    borderWidth: 1, borderColor: '#F5D4D4', alignItems: 'center',
  },
  loadMoreText: { color: '#F5908E', fontWeight: '600', fontSize: 14 },
  detailTitleCard: {
    backgroundColor: '#F8F4F4', borderRadius: 14,
    padding: 20, borderWidth: 1, borderColor: '#F5D4D4',
  },
  statusBadge: {
    alignSelf: 'flex-start', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 4, marginBottom: 12,
  },
  statusBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  detailTitle: { fontSize: 18, fontWeight: '700', color: '#2D2D2D', lineHeight: 26, marginBottom: 8 },
  detailDate: { fontSize: 13, color: '#B091A4', fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#F5908E', marginBottom: 8 },
  infoCard: {
    backgroundColor: '#F8F4F4', borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: '#F5D4D4',
  },
  divider: { height: 1, backgroundColor: '#F5D4D4', marginVertical: 12 },
  sponsorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sponsorName: { flex: 1, fontSize: 14, color: '#2D2D2D' },
  partyBadge: {
    backgroundColor: '#F5908E22', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  partyBadgeText: { fontSize: 11, color: '#F5908E', fontWeight: '600' },
  historyDate: { fontSize: 12, fontWeight: '700', color: '#F5908E', marginBottom: 4 },
  historyAction: { fontSize: 13, color: '#2D2D2D', lineHeight: 20 },
  docRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  docType: { fontSize: 14, fontWeight: '600', color: '#2D2D2D' },
  readBtn: {
    backgroundColor: '#F5908E', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 7,
    minWidth: 64, alignItems: 'center', justifyContent: 'center',
  },
  readBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  docNote: {
    fontSize: 11, color: '#B091A4', fontStyle: 'italic',
    marginTop: 10, textAlign: 'center',
  },
  fullBillBtn: {
    backgroundColor: '#F5908E', borderRadius: 14, padding: 16,
    alignItems: 'center', marginBottom: 8,
  },
  fullBillBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  attribution: {
    padding: 20, alignItems: 'center',
    borderTopWidth: 1, borderTopColor: '#F5D4D4',
    marginTop: 8, marginBottom: 8,
  },
  attributionText: { fontSize: 12, color: '#B091A4', textAlign: 'center', lineHeight: 18 },
  attributionLink: { color: '#F5908E', fontWeight: '600' },
});