// app/(tabs)/advocate.tsx
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';

type Tab = 'overview' | 'call' | 'email' | 'visit' | 'lobby';

export default function AdvocateScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'call', label: 'Call' },
    { key: 'email', label: 'Email' },
    { key: 'visit', label: 'Visit' },
    { key: 'lobby', label: 'Lobby' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Make Your Voice Heard</Text>
        <Text style={styles.headerSubtitle}>How to contact & lobby your legislators</Text>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabBar}
        contentContainerStyle={styles.tabBarContent}
      >
        {tabs.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, activeTab === t.key && styles.tabActive]}
            onPress={() => setActiveTab(t.key)}
          >
            <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.body}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'call' && <CallTab />}
        {activeTab === 'email' && <EmailTab />}
        {activeTab === 'visit' && <VisitTab />}
        {activeTab === 'lobby' && <LobbyTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Overview ────────────────────────────────────────────────────────────────

function OverviewTab() {
  const methods = [
    {
      rank: '1',
      title: 'In-Person Visit',
      effectiveness: 'Most Effective',
      effectColor: '#4CAF50',
      body: 'Meeting face-to-face is the single most powerful thing you can do. 94% of congressional staff say in-person visits have significant influence on undecided lawmakers. You become a real person, not just a number.',
    },
    {
      rank: '2',
      title: 'Personal Phone Call',
      effectiveness: 'Very Effective',
      effectColor: '#F5908E',
      body: 'Staffers rank phone calls from real constituents as the most immediate form of pressure. Calls are tallied and reported to the legislator. A genuine, emotional call from a constituent in their district carries serious weight.',
    },
    {
      rank: '3',
      title: 'Personalized Email / Letter',
      effectiveness: 'Effective',
      effectColor: '#3b82f6',
      body: '92% of congressional staff say a personalized email has real influence. The key word is personalized — form emails sent by clicking a button are far less effective and often ignored entirely.',
    },
    {
      rank: '4',
      title: 'Form / Petition Email',
      effectiveness: 'Least Effective',
      effectColor: '#9E9E9E',
      body: 'Pre-written form emails are the weakest method. They get grouped together and counted as one data point. If you use one, always add at least two personal sentences about how the issue affects you.',
    },
  ];

  return (
    <View style={styles.tabContent}>
      <Card title="What Actually Works">
        <Text style={styles.bodyText}>
          Research from surveys of congressional staff and advocacy organizations consistently
          shows the same ranking. The more personal and direct your contact, the more it matters.
          Your legislators work for you — and they keep track of what constituents say.
        </Text>
      </Card>

      {methods.map((m) => (
        <View key={m.rank} style={styles.methodCard}>
          <View style={styles.methodRankCircle}>
            <Text style={styles.methodRank}>{m.rank}</Text>
          </View>
          <View style={styles.methodBody}>
            <View style={styles.methodTitleRow}>
              <Text style={styles.methodTitle}>{m.title}</Text>
              <View style={[styles.effectBadge, { backgroundColor: m.effectColor + '22' }]}>
                <Text style={[styles.effectBadgeText, { color: m.effectColor }]}>
                  {m.effectiveness}
                </Text>
              </View>
            </View>
            <Text style={styles.methodDesc}>{m.body}</Text>
          </View>
        </View>
      ))}

      <Card title="Key Rules for All Contact">
        {[
          'Always say you are a constituent in their district — this is the most important thing.',
          'Be brief. Legislators and staff are extremely busy. Get to your point fast.',
          'Focus on one issue per contact. Multiple issues dilute your message.',
          'Always state what you want them to do — vote yes, vote no, cosponsor a bill.',
          'Be respectful even if you strongly disagree. Rudeness gets ignored.',
          'Follow up. One contact is rarely enough. Call again next week.',
          'The best time to contact is before a committee vote or floor vote on your issue.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

// ─── Call ────────────────────────────────────────────────────────────────────

function CallTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const scripts = [
    {
      id: 'support',
      label: 'Supporting a Bill',
      script: `"Hi, my name is [YOUR NAME] and I'm a constituent in [LEGISLATOR'S] district, I live at [YOUR CITY/ZIP].

I'm calling to ask [LEGISLATOR'S NAME] to support [BILL NUMBER/NAME].

This bill matters to me because [ONE PERSONAL SENTENCE about how it affects you].

I'd appreciate knowing the legislator's position on this bill. Thank you for your time."`,
    },
    {
      id: 'oppose',
      label: 'Opposing a Bill',
      script: `"Hi, my name is [YOUR NAME] and I'm a constituent in [LEGISLATOR'S] district, I live at [YOUR CITY/ZIP].

I'm calling to urge [LEGISLATOR'S NAME] to vote NO on [BILL NUMBER/NAME].

I'm concerned because [ONE PERSONAL SENTENCE about the impact on you or your community].

Please pass along my opposition. Can you tell me the legislator's current position? Thank you."`,
    },
    {
      id: 'general',
      label: 'General Issue (No Specific Bill)',
      script: `"Hi, my name is [YOUR NAME], I'm a constituent living in [YOUR CITY/ZIP].

I'm calling because I'm concerned about [THE ISSUE] and want [LEGISLATOR'S NAME] to know this matters to voters in this district.

[ONE OR TWO SENTENCES about how this issue affects you personally.]

I'd love to know if the legislator has taken a position on this. Thank you so much."`,
    },
    {
      id: 'voicemail',
      label: 'Leaving a Voicemail',
      script: `"Hi, this message is for [LEGISLATOR'S NAME]'s office. My name is [YOUR NAME], I'm a constituent at [YOUR ADDRESS or CITY/ZIP], and my callback number is [YOUR PHONE].

I'm calling about [ISSUE/BILL NAME]. I want the legislator to know that [ONE CLEAR SENTENCE stating your position and why].

Please pass this along. Thank you."`,
    },
  ];

  return (
    <View style={styles.tabContent}>
      <Card title="Before You Call">
        {[
          'Call the district office first — your call carries more weight there than in the capital.',
          'You will almost never speak directly to the legislator. That is totally normal.',
          'Ask to speak with the staffer who handles your issue (education, healthcare, etc.).',
          'Write down the staffer\'s name if you get one — use it for follow-up.',
          'If voicemail is full, press 0 to reach another staffer.',
          'Calls are tallied by topic and reported to the legislator daily.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>

      <Card title="Call Scripts">
        <Text style={styles.bodyText}>
          Tap any script to expand it. Replace the brackets with your information.
          Speak naturally — you don't have to read it word for word.
        </Text>
      </Card>

      {scripts.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={styles.scriptCard}
          onPress={() => setExpanded(expanded === s.id ? null : s.id)}
          activeOpacity={0.8}
        >
          <View style={styles.scriptHeader}>
            <Text style={styles.scriptLabel}>{s.label}</Text>
            <Text style={styles.scriptChevron}>{expanded === s.id ? '▲' : '▼'}</Text>
          </View>
          {expanded === s.id && (
            <View style={styles.scriptBody}>
              <View style={styles.divider} />
              <Text style={styles.scriptText}>{s.script}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <Card title="During the Call">
        {[
          'Identify yourself and your location immediately.',
          'State your ask clearly in the first 30 seconds.',
          'Keep it to 2 minutes or less.',
          'If asked a question you can\'t answer, say "I don\'t know but I\'ll find out."',
          'Never argue or get heated — calm and clear is always more effective.',
          'End by asking what the legislator\'s current position is.',
          'Thank them for their time before hanging up.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

// ─── Email ───────────────────────────────────────────────────────────────────

function EmailTab() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const templates = [
    {
      id: 'support',
      label: 'Support a Bill',
      subject: 'Please Support [BILL NUMBER] — Constituent from [YOUR CITY]',
      body: `Dear [Senator/Representative] [LAST NAME],

My name is [YOUR NAME], and I am a constituent in your district, living in [YOUR CITY/ZIP CODE].

I am writing to urge you to support [BILL NUMBER/NAME]. [ONE OR TWO SENTENCES explaining in plain terms what the bill does and why it matters to you personally. Be specific — mention your job, your family, your community if relevant.]

This issue directly affects [me/my family/my community] because [SPECIFIC PERSONAL REASON].

I respectfully ask that you vote YES on this bill and, if possible, encourage your colleagues to do the same. I would welcome the opportunity to discuss this further if helpful.

Thank you for your service and for considering my request.

Sincerely,
[YOUR FULL NAME]
[YOUR ADDRESS]
[YOUR PHONE]`,
    },
    {
      id: 'oppose',
      label: 'Oppose a Bill',
      subject: 'Please Vote NO on [BILL NUMBER] — Constituent from [YOUR CITY]',
      body: `Dear [Senator/Representative] [LAST NAME],

My name is [YOUR NAME], and I am a constituent in your district, living in [YOUR CITY/ZIP CODE].

I am writing to strongly urge you to vote NO on [BILL NUMBER/NAME]. [ONE OR TWO SENTENCES explaining why this bill is harmful or problematic in plain terms.]

If this bill passes, [SPECIFIC CONSEQUENCE for you, your community, or others you represent].

I respectfully ask that you oppose this legislation. I am happy to share more information or meet to discuss my concerns.

Thank you for your time and public service.

Sincerely,
[YOUR FULL NAME]
[YOUR ADDRESS]
[YOUR PHONE]`,
    },
    {
      id: 'general',
      label: 'General Issue',
      subject: '[ISSUE NAME] is Important to Your Constituent in [YOUR CITY]',
      body: `Dear [Senator/Representative] [LAST NAME],

My name is [YOUR NAME], and I live in [YOUR CITY/ZIP CODE], in your district.

I am writing today about [THE ISSUE]. This matters deeply to me because [PERSONAL REASON — one or two specific sentences about your experience or stake in the issue].

I would like to know where you stand on this issue and what actions you are taking or plan to take. I encourage you to [SPECIFIC ACTION you want them to take].

As your constituent and a voter in this district, I am paying close attention to this issue. I appreciate your time and look forward to hearing your position.

Thank you,
[YOUR FULL NAME]
[YOUR ADDRESS]
[YOUR PHONE]`,
    },
  ];

  return (
    <View style={styles.tabContent}>
      <Card title="Email Do's and Don'ts">
        <Text style={styles.sectionSubtitle}>Do:</Text>
        {[
          'Write your own words — personalized emails are dramatically more effective than form letters.',
          'State your city or zip code early so staff know you are a constituent.',
          'Keep it to one page or less. Focus on a single issue.',
          'Include a specific ask — vote yes, vote no, cosponsor, hold a hearing.',
          'Include a personal story or example of how the issue affects you.',
          'Reference the bill number if writing about specific legislation.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
        <View style={{ height: 10 }} />
        <Text style={styles.sectionSubtitle}>Don't:</Text>
        {[
          'Don\'t use a form email without adding personal sentences — they are counted as one.',
          'Don\'t cover multiple issues in one email.',
          'Don\'t use aggressive or threatening language.',
          'Don\'t use excessive jargon or acronyms.',
          'Don\'t expect a detailed personal response — most offices send form replies.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>

      <Card title="Email Templates">
        <Text style={styles.bodyText}>
          Tap to expand a template. Always personalize the bracketed sections with your own words.
        </Text>
      </Card>

      {templates.map((t) => (
        <TouchableOpacity
          key={t.id}
          style={styles.scriptCard}
          onPress={() => setExpanded(expanded === t.id ? null : t.id)}
          activeOpacity={0.8}
        >
          <View style={styles.scriptHeader}>
            <Text style={styles.scriptLabel}>{t.label}</Text>
            <Text style={styles.scriptChevron}>{expanded === t.id ? '▲' : '▼'}</Text>
          </View>
          {expanded === t.id && (
            <View style={styles.scriptBody}>
              <View style={styles.divider} />
              <Text style={styles.emailSubjectLabel}>Subject line:</Text>
              <Text style={styles.emailSubject}>{t.subject}</Text>
              <View style={styles.divider} />
              <Text style={styles.scriptText}>{t.body}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}

      <Card title="Timing Your Email">
        {[
          'Email when a bill is in committee — that\'s when it\'s most persuadable.',
          'Email again just before a floor vote — timing matters.',
          'If your legislator is on the committee reviewing the bill, prioritize contacting them.',
          'Don\'t wait until the day of a vote — offices need time to tally and report.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

// ─── Visit ───────────────────────────────────────────────────────────────────

function VisitTab() {
  return (
    <View style={styles.tabContent}>
      <Card title="Why Visit in Person?">
        <Text style={styles.bodyText}>
          In-person visits are the single most effective form of advocacy. Research shows 94% of
          congressional staff say constituent visits have real influence on undecided lawmakers.
          You become a real person with a face, not just a tally mark.
        </Text>
        <Text style={[styles.bodyText, { marginTop: 8 }]}>
          You do not have to travel to the state capital. Every legislator has a local district
          office near you, often in a nearby city. That office has a permanent staff member you can
          meet with, and your visit there carries just as much weight.
        </Text>
      </Card>

      <Card title="How to Set Up a Visit">
        {[
          'Find your legislator\'s local district office number from the Find My Legislators tab.',
          'Call the office and ask to speak with the scheduler.',
          'Request 15–30 minutes to discuss a specific issue — name the issue when you call.',
          'If the legislator is unavailable, accept a meeting with the relevant staff member. Staff opinions matter enormously to legislators.',
          'Confirm the appointment in writing by email.',
          'The best time to visit is when the legislature is NOT in session — legislators are in their home district and more available.',
        ].map((tip, i) => (
          <View key={i} style={styles.numberedRow}>
            <View style={styles.numberCircle}>
              <Text style={styles.numberText}>{i + 1}</Text>
            </View>
            <Text style={styles.numberedText}>{tip}</Text>
          </View>
        ))}
      </Card>

      <Card title="What to Bring">
        {[
          'A one-page fact sheet summarizing your issue and ask — leave it with them.',
          'Your bill number if advocating for or against specific legislation.',
          'A personal story: how this issue has affected you, your family, or community.',
          'A list of your 2–3 key points written down so you stay on track.',
          'Your contact information so staff can follow up.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>

      <Card title="During the Meeting">
        {[
          'Introduce yourself and confirm you are a constituent in their district.',
          'Lead with your personal story before any statistics or policy details.',
          'State clearly what you want them to do.',
          'Listen. Ask what their position is. Ask what concerns they have.',
          'If you don\'t know the answer to a question, say so and offer to follow up.',
          'Keep it to the time you requested — respect their schedule.',
          'End by thanking them and asking for a commitment or next step.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>

      <Card title="After the Meeting">
        {[
          'Send a thank-you email within 24 hours.',
          'Reference any commitments or next steps discussed.',
          'Follow up if they said they would get back to you and haven\'t.',
          'Come back. Building a relationship over multiple visits is far more powerful than a single meeting.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>

      <Card title="Other Ways to Meet">
        {[
          'Town halls — legislators host public meetings in their districts. Show up and ask questions.',
          'Community events — parades, ribbon cuttings, press conferences. If your legislator is there, so are you.',
          'Lobby days — advocacy organizations often organize group visits to the capitol. Check with local nonprofits.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}

// ─── Lobby ───────────────────────────────────────────────────────────────────

function LobbyTab() {
  return (
    <View style={styles.tabContent}>
      <Card title="What Is Lobbying?">
        <Text style={styles.bodyText}>
          Lobbying simply means trying to influence a legislator's vote or position on an issue.
          Every citizen has the right to do it. You do not need to be a professional lobbyist,
          a lawyer, or part of an organization. Calling your representative to say you support a
          bill is lobbying. So is showing up at their office.
        </Text>
      </Card>

      <Card title="When to Act">
        {[
          {
            timing: 'Bill Introduction',
            action: 'Contact your legislator now to express early support or opposition. Early pressure shapes their thinking before they commit.',
          },
          {
            timing: 'Committee Hearing',
            action: 'This is the most important window. If your legislator is on the committee, your contact has maximum impact. Bills can die in committee.',
          },
          {
            timing: 'Before Floor Vote',
            action: 'Call and email again. Legislators track constituent opinion heading into a vote. Remind them you are watching.',
          },
          {
            timing: 'During Recess',
            action: 'The best time for an in-person visit. Legislators are back in their home district and much more accessible.',
          },
          {
            timing: 'After a Vote',
            action: 'Thank them if they voted your way. If they didn\'t, tell them respectfully that you noticed and why it matters.',
          },
        ].map((item, i) => (
          <View key={i} style={styles.timingCard}>
            <Text style={styles.timingLabel}>{item.timing}</Text>
            <Text style={styles.timingBody}>{item.action}</Text>
          </View>
        ))}
      </Card>

      <Card title="Building a Lobbying Campaign">
        {[
          'Bring others. A constituent call is powerful. Ten constituent calls are overwhelming. Organize friends, neighbors, and colleagues.',
          'Coordinate. Have everyone call on the same day about the same bill for maximum impact.',
          'Get a local editorial or letter to the editor published — 87% of staff say these influence legislators.',
          'Build a relationship before you need it. Introduce yourself to your legislator at community events before an urgent issue arises.',
          'Partner with local organizations already working on your issue — they often have established relationships with legislative staff.',
          'Track the bill using the Bills tab in this app. Know the committee, the vote schedule, the sponsors.',
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={styles.tipDot} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </Card>

      <Card title="Elevator Pitch Formula">
        <Text style={styles.bodyText}>
          Whether in person, by phone, or in writing, every effective advocacy message follows
          the same structure:
        </Text>
        {[
          { step: 'Who you are', detail: 'Name, city, constituent in their district.' },
          { step: 'What you want', detail: 'Vote yes/no, cosponsor, hold a hearing — be specific.' },
          { step: 'Why it matters to you', detail: 'One personal sentence. Your story beats statistics every time.' },
          { step: 'The ask again', detail: 'Close by restating exactly what action you want them to take.' },
        ].map((item, i) => (
          <View key={i} style={styles.formulaRow}>
            <View style={styles.formulaStep}>
              <Text style={styles.formulaStepText}>{i + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.formulaTitle}>{item.step}</Text>
              <Text style={styles.formulaDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </Card>

      <Card title="Useful Resources">
        {[
          { label: 'ACLU Lobbying Tips', url: 'https://www.aclu-md.org/news-page/lobbying-tips-contacting-writing-and-meeting-your-elected-officials/' },
          { label: 'NRDC: How to Lobby Your Legislator', url: 'https://www.nrdc.org/stories/how-lobby-your-legislator' },
          { label: 'Find Federal Reps — congress.gov', url: 'https://www.congress.gov/members/find-your-member' },
          { label: 'USA.gov — All Elected Officials', url: 'https://www.usa.gov/elected-officials' },
        ].map((r, i) => (
          <TouchableOpacity key={i} style={styles.resourceRow} onPress={() => Linking.openURL(r.url)}>
            <Text style={styles.resourceLabel}>{r.label}</Text>
            <Text style={styles.resourceArrow}>→</Text>
          </TouchableOpacity>
        ))}
      </Card>
    </View>
  );
}

// ─── Shared components ───────────────────────────────────────────────────────

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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

  tabBar: { borderBottomWidth: 1, borderBottomColor: '#F5D4D4', maxHeight: 48 },
  tabBarContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F5D4D4',
    backgroundColor: '#F8F4F4',
  },
  tabActive: { backgroundColor: '#F5908E', borderColor: '#F5908E' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#B091A4' },
  tabTextActive: { color: '#FFFFFF' },

  body: { flex: 1 },
  tabContent: { padding: 16, gap: 14 },

  card: {
    backgroundColor: '#F8F4F4',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F5D4D4',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#2D2D2D', marginBottom: 12 },
  bodyText: { fontSize: 14, color: '#4A4A4A', lineHeight: 22 },
  sectionSubtitle: { fontSize: 13, fontWeight: '700', color: '#F5908E', marginBottom: 8 },

  tipRow: { flexDirection: 'row', gap: 10, marginBottom: 10, alignItems: 'flex-start' },
  tipDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#F5908E', marginTop: 7, flexShrink: 0 },
  tipText: { flex: 1, fontSize: 14, color: '#4A4A4A', lineHeight: 21 },

  numberedRow: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'flex-start' },
  numberCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#F5908E', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  numberText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  numberedText: { flex: 1, fontSize: 14, color: '#4A4A4A', lineHeight: 21 },

  methodCard: {
    backgroundColor: '#F8F4F4',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F5D4D4',
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  methodRankCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F5908E', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  methodRank: { color: '#fff', fontWeight: '700', fontSize: 16 },
  methodBody: { flex: 1 },
  methodTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' },
  methodTitle: { fontSize: 15, fontWeight: '700', color: '#2D2D2D' },
  effectBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  effectBadgeText: { fontSize: 11, fontWeight: '600' },
  methodDesc: { fontSize: 13, color: '#4A4A4A', lineHeight: 20 },

  scriptCard: {
    backgroundColor: '#F8F4F4',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F5D4D4',
    overflow: 'hidden',
  },
  scriptHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14,
  },
  scriptLabel: { fontSize: 15, fontWeight: '600', color: '#2D2D2D' },
  scriptChevron: { fontSize: 11, color: '#B091A4' },
  scriptBody: { paddingHorizontal: 14, paddingBottom: 14 },
  scriptText: { fontSize: 14, color: '#4A4A4A', lineHeight: 23, fontFamily: 'System' },
  emailSubjectLabel: { fontSize: 11, fontWeight: '700', color: '#B091A4', textTransform: 'uppercase', marginBottom: 4 },
  emailSubject: { fontSize: 14, fontWeight: '600', color: '#2D2D2D', marginBottom: 4 },

  divider: { height: 1, backgroundColor: '#F5D4D4', marginVertical: 10 },

  timingCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#F5908E',
    paddingLeft: 12,
    marginBottom: 14,
  },
  timingLabel: { fontSize: 13, fontWeight: '700', color: '#F5908E', marginBottom: 3 },
  timingBody: { fontSize: 14, color: '#4A4A4A', lineHeight: 21 },

  formulaRow: { flexDirection: 'row', gap: 12, marginTop: 12, alignItems: 'flex-start' },
  formulaStep: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F5908E22', borderWidth: 1, borderColor: '#F5908E',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  formulaStepText: { fontSize: 13, fontWeight: '700', color: '#F5908E' },
  formulaTitle: { fontSize: 14, fontWeight: '700', color: '#2D2D2D', marginBottom: 2 },
  formulaDetail: { fontSize: 13, color: '#4A4A4A', lineHeight: 20 },

  resourceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5D4D4',
  },
  resourceLabel: { fontSize: 14, color: '#F5908E', fontWeight: '600' },
  resourceArrow: { fontSize: 16, color: '#F5908E' },
});