// app/(tabs)/profile.tsx
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from 'expo-router';
import { WebView } from 'react-native-webview';

const STATE_LOOKUP_URLS: Record<string, string> = {
  AL: 'https://www.legislature.state.al.us/aliswww/ISD/ALFindMyLegislator.aspx',
  AK: 'https://www.akleg.gov/basis/Home/FindMyLegislator',
  AZ: 'https://www.azleg.gov/find-my-legislator/',
  AR: 'https://www.arkleg.state.ar.us/Legislators/List',
  CA: 'https://findyourrep.legislature.ca.gov/',
  CO: 'https://leg.colorado.gov/find-my-legislator',
  CT: 'https://www.cga.ct.gov/asp/content/cgafindlegislator.asp',
  DE: 'https://legis.delaware.gov/Offices/Find-My-Legislators',
  FL: 'https://www.myfloridahouse.gov/FindYourRepresentative',
  GA: 'https://www.legis.ga.gov/find-my-legislator',
  HI: 'https://www.capitol.hawaii.gov/findyourlegislator/findlegislator.aspx',
  ID: 'https://legislature.idaho.gov/legislators/whoismylegislator/',
  IL: 'https://www.ilga.gov/mylegislator/mylegislator.asp',
  IN: 'https://iga.in.gov/legislative/find-legislators/',
  IA: 'https://www.legis.iowa.gov/legislators/find',
  KS: 'https://www.kslegislature.org/li/find_my_legislator/',
  KY: 'https://legislature.ky.gov/Legislators/Pages/find-my-legislator.aspx',
  LA: 'https://www.legis.la.gov/legis/FindMyLegislators.aspx',
  ME: 'https://legislature.maine.gov/findmylegislator/',
  MD: 'https://mgaleg.maryland.gov/mgawebsite/Membership/District',
  MA: 'https://malegislature.gov/Legislators/FindMyLegislator',
  MI: 'https://www.legislature.mi.gov/MiLEGS/RepresentativeLocator',
  MN: 'https://www.leg.mn.gov/leg/findmylegislator',
  MS: 'https://www.legislature.ms.gov/find-my-legislator/',
  MO: 'https://www.senate.mo.gov/LegisLookup/',
  MT: 'https://leg.mt.gov/legislators/find-a-legislator/',
  NE: 'https://nebraskalegislature.gov/senators/find_senator.php',
  NV: 'https://www.leg.state.nv.us/App/Legislator/A/',
  NH: 'https://gencourt.state.nh.us/whoismylegislator/',
  NJ: 'https://www.njleg.state.nj.us/legislative-roster/find-your-legislator',
  NM: 'https://www.nmlegis.gov/Members/Find_My_Legislator',
  NY: 'https://www.nysenate.gov/find-my-senator',
  NC: 'https://www.ncleg.gov/FindYourLegislators',
  ND: 'https://www.legis.nd.gov/find-my-legislators',
  OH: 'https://www.legislature.ohio.gov/legislators/find-my-legislator',
  OK: 'https://www.oklegislature.gov/findlegislators.aspx',
  OR: 'https://oregonlegislature.gov/findyourlegislator/Pages/default.aspx',
  PA: 'https://www.legis.state.pa.us/cfdocs/legis/home/findyourlegislator/',
  RI: 'https://www.rilegislature.gov/pages/findlegislator.aspx',
  SC: 'https://www.scstatehouse.gov/legislatorssearch.php',
  SD: 'https://sdlegislature.gov/Legislators/FindMyLegislator',
  TN: 'https://www.capitol.tn.gov/legislators/find-your-legislators.aspx',
  TX: 'https://www.capitol.texas.gov/Home.aspx',
  UT: 'https://le.utah.gov/GIS/findDistrict.jsp',
  VT: 'https://legislature.vermont.gov/people/find-your-legislator/',
  VA: 'https://whosmy.virginiageneralassembly.gov/',
  WA: 'https://app.leg.wa.gov/DistrictFinder/',
  WV: 'https://www.wvlegislature.gov/find_a_legislator.cfm',
  WI: 'https://legis.wisconsin.gov/findmylegislator/',
  WY: 'https://www.wyoleg.gov/Legislators/FindMyLegislator',
};

export default function LegislatorsScreen() {
  const [selectedState, setSelectedState] = useState({ code: 'GA', name: 'Georgia' });
  const [showWebView, setShowWebView] = useState(false);
  const [webViewLoading, setWebViewLoading] = useState(true);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    AsyncStorage.getItem('selectedState').then((val) => {
      const state = val ? JSON.parse(val) : { code: 'GA', name: 'Georgia' };
      setSelectedState(state);
    });
  }, [isFocused]);

  const url =
    STATE_LOOKUP_URLS[selectedState.code] ??
    `https://www.google.com/search?q=find+my+legislator+${selectedState.name}`;

  if (showWebView) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webHeader}>
          <TouchableOpacity onPress={() => setShowWebView(false)} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.webHeaderTitle} numberOfLines={1}>
            {selectedState.name} Legislators
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL(url)} style={styles.openBtn}>
            <Text style={styles.openBtnText}>Browser</Text>
          </TouchableOpacity>
        </View>
        <WebView
          source={{ uri: url }}
          style={styles.webView}
          onLoadStart={() => setWebViewLoading(true)}
          onLoadEnd={() => setWebViewLoading(false)}
        />
        {webViewLoading && (
          <View style={styles.webViewLoader}>
            <Text style={styles.webViewLoaderText}>Loading...</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Find Your Legislators</Text>
        <Text style={styles.headerSubtitle}>{selectedState.name}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Look Up Your Representatives</Text>
          <Text style={styles.cardBody}>
            Find your exact State Senator, State Representative, and other officials using the
            official {selectedState.name} Legislature website. Enter your address there to get
            accurate district-based results.
          </Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setShowWebView(true)}>
            <Text style={styles.primaryBtnText}>Find My Legislators</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => Linking.openURL(url)}>
            <Text style={styles.secondaryBtnText}>Open in Browser Instead</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>What You'll Find</Text>
          {[
            'Your State Senator',
            'Your State House Representative',
            'Their phone & contact info',
            'Committee assignments',
            'Voting record',
          ].map((item, i) => (
            <View key={i} style={styles.infoRow}>
              <View style={styles.infoDot} />
              <Text style={styles.infoText}>{item}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Federal Representatives</Text>
          <Text style={styles.infoBody}>
            For U.S. Senators and your U.S. House Representative, visit the official federal
            directory.
          </Text>
          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => Linking.openURL('https://www.congress.gov/members/find-your-member')}
          >
            <Text style={styles.linkBtnText}>congress.gov — Find My Member</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footerNote}>
          Data is maintained by official government sources and is always current.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    backgroundColor: '#F5908E',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E08A88',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#FFFFFF', opacity: 0.9, marginTop: 2 },
  webHeader: {
    backgroundColor: '#F5908E',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E08A88',
  },
  backBtn: { paddingRight: 12, paddingVertical: 4 },
  backBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  webHeaderTitle: { flex: 1, color: '#FFFFFF', fontWeight: '700', fontSize: 15, textAlign: 'center' },
  openBtn: { paddingLeft: 12, paddingVertical: 4 },
  openBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600' },
  webView: { flex: 1 },
  webViewLoader: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  webViewLoaderText: { color: '#B091A4', fontSize: 14 },
  body: { padding: 16, gap: 14, paddingBottom: 40 },
  card: {
    backgroundColor: '#F8F4F4',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F5D4D4',
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#2D2D2D', marginBottom: 10 },
  cardBody: { fontSize: 14, color: '#6B5B5B', lineHeight: 21, marginBottom: 16 },
  primaryBtn: {
    backgroundColor: '#F5908E',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5908E',
  },
  secondaryBtnText: { color: '#F5908E', fontWeight: '600', fontSize: 14 },
  infoCard: {
    backgroundColor: '#F8F4F4',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F5D4D4',
  },
  infoTitle: { fontSize: 15, fontWeight: '700', color: '#2D2D2D', marginBottom: 12 },
  infoBody: { fontSize: 13, color: '#6B5B5B', lineHeight: 20, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 10 },
  infoDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#F5908E' },
  infoText: { fontSize: 14, color: '#2D2D2D' },
  linkBtn: {
    backgroundColor: '#F5908E18',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F5908E55',
  },
  linkBtnText: { color: '#F5908E', fontWeight: '600', fontSize: 13 },
  footerNote: {
    fontSize: 12,
    color: '#B091A4',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});