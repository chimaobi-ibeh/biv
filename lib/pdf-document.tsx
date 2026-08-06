import React from 'react';
import path from 'path';
import fs from 'fs';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Circle,
  Path,
  Line,
  Font,
} from '@react-pdf/renderer';
import { AssessmentResult } from '@/types';

// ── Fonts ──────────────────────────────────────────────────────
// Montserrat (bundled under public/fonts, traced into the /api/pdf function).
const FONT_DIR = path.join(process.cwd(), 'public', 'fonts');
Font.register({
  family: 'Montserrat',
  fonts: [
    { src: path.join(FONT_DIR, 'Montserrat-Regular.ttf'), fontWeight: 400 },
    { src: path.join(FONT_DIR, 'Montserrat-SemiBold.ttf'), fontWeight: 600 },
    { src: path.join(FONT_DIR, 'Montserrat-Bold.ttf'), fontWeight: 700 },
  ],
});
// Wrap whole words instead of hyphenating mid-word.
Font.registerHyphenationCallback((word) => [word]);

// Logo (coloured version; sits inside a white rounded box).
// Read the local file into a buffer so react-pdf embeds it directly instead of
// trying to fetch it over the network (which fails server-side).
let LOGO_DATA: Buffer | null = null;
try {
  LOGO_DATA = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'));
} catch {
  LOGO_DATA = null;
}

// ── Design system ──────────────────────────────────────────────
const C = {
  white: '#FFFFFF',
  navy: '#15325C', // section badges, dark text, dark boxes
  cover: '#173A68', // cover / CTA background
  coverDeep: '#102E58',
  blue: '#2E6FD6', // accent / numbered badges
  blueSoft: '#EEF3FB', // light callout background
  gold: '#E2A23B', // yellow-light accent
  goldBg: '#FCF4E4', // needs-work pill / areas box
  goldBorder: '#F1E2C4',
  green: '#27AE73', // strong / success
  greenBg: '#E7F6EF',
  greenBorder: '#CDEAD9',
  red: '#E25B53', // critical gaps
  redBg: '#FCEEEC',
  track: '#2C4D7E', // ring track on navy
  ink: '#2C3645', // body text
  inkSoft: '#5B6573', // secondary text
  line: '#E6E9EF', // hairline borders
  rowAlt: '#F6F8FB', // table zebra
  pageNum: '#9AA4B2',
};

// ── Helpers ────────────────────────────────────────────────────
type StatusMeta = {
  label: string;
  accent: string;
  accentBg: string;
  caution: string;
  sub: string;
};

const statusMeta = (level: string): StatusMeta => {
  switch ((level || '').toLowerCase()) {
    case 'green':
      return {
        label: 'Green Light',
        accent: C.green,
        accentBg: C.greenBg,
        caution: 'Proceed with confidence',
        sub: 'Ready to build',
      };
    case 'red':
      return {
        label: 'Red Light',
        accent: C.red,
        accentBg: C.redBg,
        caution: 'Pause and rethink',
        sub: 'Fix the fundamentals first',
      };
    default:
      return {
        label: 'Yellow Light',
        accent: C.gold,
        accentBg: C.goldBg,
        caution: 'Proceed with caution',
        sub: 'Validate before you build',
      };
  }
};

// Replace em dashes with a spaced hyphen so none ever appear in the PDF.
const noEmDash = (text: string): string => (text || '').replace(/\s*—\s*/g, ' - ');

const splitParagraphs = (text: string): string[] =>
  noEmDash(text)
    .split(/\n{2,}|\r\n\r\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

// ── Styles ─────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: { fontFamily: 'Montserrat', color: C.ink, backgroundColor: C.white },
  content: { paddingHorizontal: 48, paddingTop: 44, paddingBottom: 56 },

  // Footer (light pages)
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: C.line,
    paddingTop: 8,
  },
  footerText: { fontSize: 8, color: C.pageNum },

  // Section header (number badge + title + subtitle)
  secHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 22 },
  secBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: C.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  secBadgeText: { color: C.white, fontSize: 12, fontFamily: 'Montserrat', fontWeight: 700 },
  secTitle: { fontSize: 21, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy },
  secSub: { fontSize: 10, color: C.inkSoft, marginTop: 1 },

  // Generic text
  body: { fontSize: 10.5, color: C.ink, lineHeight: 1.55 },
  bodySoft: { fontSize: 10, color: C.inkSoft, lineHeight: 1.55 },

  // ── Cover ──
  cover: { fontFamily: 'Montserrat', backgroundColor: C.cover, position: 'relative' },
  coverPad: { paddingHorizontal: 56, paddingTop: 64 },
  coverLogoBox: {
    backgroundColor: C.white,
    borderRadius: 16,
    width: 116,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  coverLogo: { width: 84, height: 28, objectFit: 'contain' },
  coverEyebrow: {
    fontSize: 11,
    letterSpacing: 3,
    color: '#9DBBE6',
    fontFamily: 'Montserrat', fontWeight: 700,
    marginBottom: 14,
  },
  coverTitle: {
    fontSize: 42,
    fontFamily: 'Montserrat', fontWeight: 700,
    color: C.white,
    lineHeight: 1.12,
  },
  coverMetaRow: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 150,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ringWrap: { width: 132, height: 132, position: 'relative', marginRight: 32 },
  ringCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 132,
    height: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPct: { fontSize: 30, fontFamily: 'Montserrat', fontWeight: 700, color: C.white },
  ringStatus: { fontSize: 8, letterSpacing: 1.5, fontFamily: 'Montserrat', fontWeight: 700, marginTop: 2 },
  metaCol: { flex: 1 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metaItem: { width: '50%', marginBottom: 14 },
  metaLabel: { fontSize: 8, letterSpacing: 2, color: '#8FAAD4', fontFamily: 'Montserrat', fontWeight: 700 },
  metaValue: { fontSize: 13, color: C.white, fontFamily: 'Montserrat', fontWeight: 700, marginTop: 3 },
  coverIndicators: { position: 'absolute', left: 56, bottom: 120, fontSize: 10, color: '#B9CBE6' },
  coverFooter: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#2C4D7E',
    paddingTop: 14,
  },
  coverFooterText: { fontSize: 9, color: '#B9CBE6' },

  // ── Contents ──
  tocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  tocNum: { width: 30, fontSize: 11, fontFamily: 'Montserrat', fontWeight: 700, color: C.blue },
  tocTitle: { fontSize: 14, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy },
  tocDesc: { fontSize: 9, color: C.inkSoft, marginTop: 1 },
  tocPage: { fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy },
  tocNote: {
    marginTop: 26,
    backgroundColor: C.blueSoft,
    borderLeftWidth: 4,
    borderLeftColor: C.blue,
    borderRadius: 6,
    padding: 16,
  },

  // ── Executive summary ──
  banner: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 18,
    marginBottom: 18,
  },
  bannerPill: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  bannerPillText: { fontSize: 8, letterSpacing: 1.2, fontFamily: 'Montserrat', fontWeight: 700, color: C.white },
  cardsRow: { flexDirection: 'row', marginBottom: 18 },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 5,
  },
  statLabel: { fontSize: 8, letterSpacing: 1.5, color: C.inkSoft, fontFamily: 'Montserrat', fontWeight: 700 },
  miniPill: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginTop: 8,
  },
  miniPillText: { fontSize: 8, fontFamily: 'Montserrat', fontWeight: 700 },
  callout: {
    backgroundColor: C.blueSoft,
    borderLeftWidth: 4,
    borderLeftColor: C.navy,
    borderRadius: 6,
    padding: 16,
    marginBottom: 20,
  },
  glanceBox: { borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 18 },
  glanceTitle: { fontSize: 13, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy, marginBottom: 12 },
  glanceBars: { flexDirection: 'row', marginBottom: 12 },
  glanceBar: { flex: 1, height: 9, borderRadius: 5, marginRight: 4 },
  legendRow: { flexDirection: 'row' },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 9, color: C.ink, marginRight: 20 },

  // ── Dimension table ──
  tableHead: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  th: { fontSize: 8, letterSpacing: 1, color: C.inkSoft, fontFamily: 'Montserrat', fontWeight: 700 },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  tdName: { flex: 3.2, fontSize: 11, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy },
  tdScore: { flex: 1.2, fontSize: 10, color: C.inkSoft },
  tdProg: { flex: 3 },
  tdStatus: { flex: 2, alignItems: 'flex-end' },
  rowBar: { height: 8, borderRadius: 4, backgroundColor: C.line, overflow: 'hidden' },
  rowBarFill: { height: '100%', borderRadius: 4 },
  statusBadge: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  statusBadgeText: { fontSize: 8.5, fontFamily: 'Montserrat', fontWeight: 700 },

  twoBoxRow: { flexDirection: 'row', marginTop: 20 },
  pillBox: { flex: 1, borderRadius: 10, padding: 16 },
  pillBoxTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pillBoxTitle: { fontSize: 12, fontFamily: 'Montserrat', fontWeight: 700 },
  pillWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  tagPill: {
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
  },
  tagPillText: { fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700 },

  // ── AI insights ──
  insightCard: { borderRadius: 12, marginBottom: 20, overflow: 'hidden', borderWidth: 1, borderColor: C.line },
  insightHeader: { paddingVertical: 12, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' },
  insightHeaderText: { fontSize: 14, fontFamily: 'Montserrat', fontWeight: 700, color: C.white },
  insightBody: { padding: 18, paddingTop: 14 },
  insightItem: { flexDirection: 'row', marginBottom: 12 },
  insightMark: { width: 18, marginTop: 1 },
  insightText: { flex: 1, fontSize: 10.5, color: C.ink, lineHeight: 1.5 },

  // ── Action plan ──
  introText: { fontSize: 11, color: C.ink, lineHeight: 1.6, marginBottom: 18 },
  priorityCard: {
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
  },
  priorityHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priorityNum: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  priorityNumText: { color: C.white, fontSize: 11, fontFamily: 'Montserrat', fontWeight: 700 },
  priorityTitle: { fontSize: 12.5, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy },

  // ── Roadmap ──
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  weekCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  weekHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 4, borderBottomWidth: 1, borderBottomColor: C.line, paddingBottom: 8 },
  weekBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },
  weekBadgeText: { color: C.white, fontSize: 9, fontFamily: 'Montserrat', fontWeight: 700 },
  weekTitle: { fontSize: 12, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy },
  weekTask: { flexDirection: 'row', marginTop: 9 },
  weekDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.blue, marginTop: 5, marginRight: 7 },
  weekTaskText: { flex: 1, fontSize: 9, color: C.ink, lineHeight: 1.45 },

  // ── Resources ──
  resGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  resCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: 10,
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
  },
  resBadge: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  resBadgeText: { color: C.white, fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700 },
  resTitle: { fontSize: 11.5, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy },
  resDesc: { fontSize: 9, color: C.inkSoft, lineHeight: 1.45, marginTop: 6 },

  // ── Risk ──
  frankBox: { backgroundColor: C.navy, borderRadius: 10, padding: 18, marginBottom: 22 },
  frankLabel: { fontSize: 9, letterSpacing: 2, color: '#9DBBE6', fontFamily: 'Montserrat', fontWeight: 700, marginBottom: 8 },
  frankText: { fontSize: 10.5, color: '#E4ECF6', lineHeight: 1.6 },
  riskLabel: { fontSize: 9, letterSpacing: 1.5, color: C.inkSoft, fontFamily: 'Montserrat', fontWeight: 700, marginBottom: 4 },
  riskRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.line },
  riskNum: { width: 38, fontSize: 22, fontFamily: 'Montserrat', fontWeight: 700, color: '#D7DEE8' },
  riskTextWrap: { flex: 1 },
  riskUnderline: { width: 22, height: 3, backgroundColor: C.gold, borderRadius: 2, marginTop: 6, marginBottom: 6 },
  riskText: { fontSize: 10, color: C.ink, lineHeight: 1.5 },
  mitiBox: { backgroundColor: C.blueSoft, borderRadius: 10, padding: 16, marginTop: 20 },
  mitiLabel: { fontSize: 9, letterSpacing: 1.5, color: C.green, fontFamily: 'Montserrat', fontWeight: 700, marginBottom: 8 },

  // ── CTA ──
  ctaPage: { fontFamily: 'Montserrat', backgroundColor: C.cover, paddingHorizontal: 56, paddingTop: 72 },
  ctaTitle: { fontSize: 36, fontFamily: 'Montserrat', fontWeight: 700, color: C.white, marginTop: 28, marginBottom: 12 },
  ctaIntro: { fontSize: 12, color: '#C5D4E8', lineHeight: 1.6, marginBottom: 30, maxWidth: 360 },
  ctaCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: '#2C4D7E',
    borderRadius: 10,
    padding: 18,
    marginBottom: 14,
    maxWidth: 380,
  },
  ctaCardTitle: { fontSize: 14, fontFamily: 'Montserrat', fontWeight: 700, color: C.white, marginBottom: 4 },
  ctaCardDesc: { fontSize: 9.5, color: '#B9CBE6', marginBottom: 6 },
  ctaCardLink: { fontSize: 10, fontFamily: 'Montserrat', fontWeight: 700, color: '#7FB0F0' },
  ctaFooter: {
    position: 'absolute',
    left: 56,
    right: 56,
    bottom: 40,
    borderTopWidth: 1,
    borderTopColor: '#2C4D7E',
    paddingTop: 14,
  },
  ctaFooterText: { fontSize: 9, color: '#9DB4D4' },
});

// ── Reusable sub-components ─────────────────────────────────────
const Footer: React.FC<{ page: number }> = ({ page }) => (
  <View style={styles.footer} fixed>
    <Text style={styles.footerText}>
      BeamX Solutions · Business Idea Validation Report
    </Text>
    <Text style={styles.footerText}>
      www.beamxsolutions.com · {String(page).padStart(2, '0')}
    </Text>
  </View>
);

const SectionHeader: React.FC<{ num: string; title: string; sub: string }> = ({
  num,
  title,
  sub,
}) => (
  <View style={styles.secHeader}>
    <View style={styles.secBadge}>
      <Text style={styles.secBadgeText}>{num}</Text>
    </View>
    <View>
      <Text style={styles.secTitle}>{title}</Text>
      <Text style={styles.secSub}>{sub}</Text>
    </View>
  </View>
);

// Small drawn marks (Helvetica lacks ✓ / ⚠ glyphs)
const Check: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path
      d="M3 8.5 L6.5 12 L13 4.5"
      stroke={color}
      strokeWidth={2}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Warn: React.FC<{ color: string; size?: number }> = ({ color, size = 12 }) => (
  <Svg width={size} height={size} viewBox="0 0 16 16">
    <Path
      d="M8 2 L15 14 L1 14 Z"
      stroke={color}
      strokeWidth={1.6}
      fill="none"
      strokeLinejoin="round"
    />
    <Path d="M8 6.5 L8 10" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
    <Circle cx={8} cy={12} r={0.9} fill={color} />
  </Svg>
);

// Donut progress ring (SVG)
const Ring: React.FC<{ pct: number; color: string; statusLabel: string }> = ({
  pct,
  color,
  statusLabel,
}) => {
  const cx = 66;
  const cy = 66;
  const r = 56;
  const sweep = (360 * Math.max(0, Math.min(99.999, pct))) / 100;
  const pt = (a: number): [number, number] => [
    cx + r * Math.sin((a * Math.PI) / 180),
    cy - r * Math.cos((a * Math.PI) / 180),
  ];
  const [sx, sy] = pt(0);
  const [ex, ey] = pt(sweep);
  const large = sweep > 180 ? 1 : 0;
  const arcPath = `M ${sx} ${sy} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`;
  return (
    <View style={styles.ringWrap}>
      <Svg width={132} height={132} viewBox="0 0 132 132">
        <Circle cx={cx} cy={cy} r={r} stroke={C.track} strokeWidth={11} fill="none" />
        <Path d={arcPath} stroke={color} strokeWidth={11} fill="none" strokeLinecap="round" />
      </Svg>
      <View style={styles.ringCenter}>
        <Text style={styles.ringPct}>{pct}%</Text>
        <Text style={[styles.ringStatus, { color }]}>{statusLabel.toUpperCase()}</Text>
      </View>
    </View>
  );
};

// ── Document ────────────────────────────────────────────────────
interface PDFDocumentProps {
  result: AssessmentResult;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ result }) => {
  const { scoreResult, dimensionScores, aiRecommendation, userProfile } = result;
  const meta = statusMeta(scoreResult.level);
  const pct = Math.round(scoreResult.score);
  const total = dimensionScores.length || 10;
  const positive = scoreResult.totalPositive;

  const strongDims = dimensionScores.filter((d) => d.score >= d.maxScore);
  const weakDims = dimensionScores.filter((d) => d.score < d.maxScore);

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const priorities = aiRecommendation
    ? splitParagraphs(aiRecommendation.personalizedPlan)
    : [];

  // Chunk roadmap into pages of 4 weeks (2×2 grid)
  const roadmap = aiRecommendation?.weeklyRoadmap ?? [];
  const roadmapPages: typeof roadmap[] = [];
  for (let i = 0; i < roadmap.length; i += 4) {
    roadmapPages.push(roadmap.slice(i, i + 4));
  }

  const tocEntries = [
    ['01', 'Executive Summary', 'Score, status and timeframe', '03'],
    ['02', 'Dimension Analysis', 'Ten readiness dimensions', '04'],
    ['03', 'AI-Powered Insights', 'Strengths and critical gaps', '05'],
    ['04', 'Your Action Plan', 'Where to focus first', '06'],
    ['05', 'Weekly Roadmap', 'A week-by-week execution plan', '07'],
    ['06', 'Recommended Resources', 'Tools, communities and reading', '09'],
    ['07', 'Risk Assessment', 'A frank, honest read', '10'],
    ['08', 'Take Action', 'Work with BeamX Solutions', '11'],
  ];

  return (
    <Document>
      {/* ── COVER ── */}
      <Page size="A4" style={styles.cover}>
        <View fixed style={{ position: 'absolute', top: 0, left: 0, width: 595, height: 842 }}>
          <Svg width={595} height={842}>
            <Line x1={430} y1={120} x2={650} y2={560} stroke="#23467C" strokeWidth={2} />
            <Line x1={520} y1={120} x2={300} y2={620} stroke="#21437A" strokeWidth={2} />
          </Svg>
        </View>

        <View style={styles.coverPad}>
          <View style={styles.coverLogoBox}>
            {LOGO_DATA ? <Image src={{ data: LOGO_DATA, format: 'png' }} style={styles.coverLogo} /> : null}
          </View>
          <Text style={styles.coverEyebrow}>DATA-DRIVEN STARTUP VALIDATION</Text>
          <Text style={styles.coverTitle}>Business Idea{'\n'}Validation Report</Text>
        </View>

        <View style={styles.coverMetaRow}>
          <Ring pct={pct} color={meta.accent} statusLabel={meta.label.replace(' Light', ' Light')} />
          <View style={styles.metaCol}>
            <View style={styles.metaGrid}>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>BUSINESS</Text>
                <Text style={styles.metaValue}>{noEmDash(userProfile.name || '') || 'Your venture'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>SECTOR</Text>
                <Text style={styles.metaValue}>{noEmDash(userProfile.industry || '') || 'N/A'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>LOCATION</Text>
                <Text style={styles.metaValue}>{noEmDash(userProfile.location || '') || 'N/A'}</Text>
              </View>
              <View style={styles.metaItem}>
                <Text style={styles.metaLabel}>DATE</Text>
                <Text style={styles.metaValue}>{reportDate}</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.coverIndicators}>
          {positive} of {total} positive indicators
        </Text>

        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterText}>
            Prepared by <Text style={{ fontFamily: 'Montserrat', fontWeight: 700 }}>BeamX Solutions</Text>
          </Text>
          <Text style={styles.coverFooterText}>www.beamxsolutions.com</Text>
        </View>
      </Page>

      {/* ── CONTENTS ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <SectionHeader num="00" title="Contents" sub="What is inside this report" />
          {tocEntries.map(([num, title, desc, pg]) => (
            <View key={num} style={styles.tocRow}>
              <Text style={styles.tocNum}>{num}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.tocTitle}>{title}</Text>
                <Text style={styles.tocDesc}>{desc}</Text>
              </View>
              <Text style={styles.tocPage}>{pg}</Text>
            </View>
          ))}
          <View style={styles.tocNote}>
            <Text style={styles.body}>
              This report blends a structured 10-point readiness score with AI-generated
              insight tailored to your context. Read it top to bottom, then act on the roadmap.
            </Text>
          </View>
        </View>
        <Footer page={2} />
      </Page>

      {/* ── EXECUTIVE SUMMARY ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <SectionHeader num="01" title="Executive Summary" sub="Where this idea stands today" />

          <View style={[styles.banner, { backgroundColor: meta.accentBg }]}>
            <View style={{ width: 120, paddingRight: 12 }}>
              <View style={[styles.bannerPill, { backgroundColor: meta.accent }]}>
                <Text style={styles.bannerPillText}>{meta.label.toUpperCase()}</Text>
              </View>
              <Text style={{ fontSize: 22, fontFamily: 'Montserrat', fontWeight: 700, color: meta.accent }}>
                {positive}
                <Text style={{ fontSize: 11, color: C.inkSoft }}> / {total} indicators</Text>
              </Text>
            </View>
            <Text style={[styles.body, { flex: 1, borderLeftWidth: 1, borderLeftColor: C.line, paddingLeft: 14 }]}>
              {scoreResult.summary ||
                `You scored ${positive} out of ${total}. ${meta.caution}. Close the gaps below before you commit to building.`}
            </Text>
          </View>

          <View style={styles.cardsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>OVERALL SCORE</Text>
              <Text style={{ fontSize: 30, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy, marginTop: 4 }}>
                {pct}
                <Text style={{ fontSize: 14 }}>%</Text>
              </Text>
              <View style={{ height: 6, backgroundColor: C.line, borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                <View style={{ width: `${pct}%`, height: '100%', backgroundColor: meta.accent, borderRadius: 3 }} />
              </View>
              <Text style={[styles.bodySoft, { marginTop: 6, fontSize: 9 }]}>
                {positive} of {total} positive
              </Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>STATUS</Text>
              <Text style={{ fontSize: 20, fontFamily: 'Montserrat', fontWeight: 700, color: meta.accent, marginTop: 4 }}>
                {meta.label}
              </Text>
              <View style={[styles.miniPill, { backgroundColor: meta.accentBg }]}>
                <Text style={[styles.miniPillText, { color: meta.accent }]}>{meta.caution}</Text>
              </View>
              <Text style={[styles.bodySoft, { marginTop: 6, fontSize: 9 }]}>{meta.sub}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>RECOMMENDED TIMEFRAME</Text>
              <Text style={{ fontSize: 18, fontFamily: 'Montserrat', fontWeight: 700, color: C.navy, marginTop: 4 }}>
                {scoreResult.timeframe || '2 to 3 weeks'}
              </Text>
              <View style={[styles.miniPill, { backgroundColor: C.blueSoft }]}>
                <Text style={[styles.miniPillText, { color: C.blue }]}>Fix gaps, then launch</Text>
              </View>
              <Text style={[styles.bodySoft, { marginTop: 6, fontSize: 9 }]}>Focused validation sprint</Text>
            </View>
          </View>

          <View style={styles.callout}>
            <Text style={styles.body}>
              <Text style={{ fontFamily: 'Montserrat', fontWeight: 700 }}>What this means. </Text>
              You have {strongDims.length} strong {strongDims.length === 1 ? 'dimension' : 'dimensions'}
              {strongDims.length ? ` (${strongDims.map((d) => d.name).join(', ')})` : ''}. The pieces
              still needing work are {weakDims.length ? weakDims.map((d) => d.name).join(', ') : 'minimal'}.
              Close those and this report moves toward green.
            </Text>
          </View>

          <View style={styles.glanceBox}>
            <Text style={styles.glanceTitle}>Readiness at a glance</Text>
            <View style={styles.glanceBars}>
              {dimensionScores.map((d, i) => (
                <View
                  key={i}
                  style={[styles.glanceBar, { backgroundColor: d.score >= d.maxScore ? C.green : C.gold }]}
                />
              ))}
            </View>
            <View style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: C.green }]} />
              <Text style={styles.legendText}>Strong · {strongDims.length} dimensions</Text>
              <View style={[styles.legendDot, { backgroundColor: C.gold }]} />
              <Text style={styles.legendText}>Needs work · {weakDims.length} dimensions</Text>
            </View>
          </View>
        </View>
        <Footer page={3} />
      </Page>

      {/* ── DIMENSION ANALYSIS ── */}
      <Page size="A4" style={styles.page}>
        <View style={styles.content}>
          <SectionHeader num="02" title="Dimension Analysis" sub="Ten dimensions that predict readiness" />

          <View style={styles.tableHead}>
            <Text style={[styles.th, { flex: 3.2 }]}>DIMENSION</Text>
            <Text style={[styles.th, { flex: 1.2 }]}>SCORE</Text>
            <Text style={[styles.th, { flex: 3 }]}>PROGRESS</Text>
            <Text style={[styles.th, { flex: 2, textAlign: 'right' }]}>STATUS</Text>
          </View>

          {dimensionScores.map((d, i) => {
            const strong = d.score >= d.maxScore;
            const fillPct = d.maxScore > 0 ? (d.score / d.maxScore) * 100 : 0;
            return (
              <View key={i} style={[styles.tableRow, i % 2 === 1 ? { backgroundColor: C.rowAlt } : {}]}>
                <Text style={styles.tdName}>{d.name}</Text>
                <Text style={styles.tdScore}>
                  <Text style={{ fontFamily: 'Montserrat', fontWeight: 700, color: C.navy }}>{d.score}</Text> / {d.maxScore}
                </Text>
                <View style={styles.tdProg}>
                  <View style={styles.rowBar}>
                    <View
                      style={[
                        styles.rowBarFill,
                        { width: `${strong ? fillPct : 14}%`, backgroundColor: strong ? C.green : C.gold },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.tdStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: strong ? C.greenBg : C.goldBg }]}>
                    <Text style={[styles.statusBadgeText, { color: strong ? C.green : C.gold }]}>
                      {strong ? 'Strong' : 'Needs Work'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}

          <View style={styles.twoBoxRow}>
            <View style={[styles.pillBox, { backgroundColor: C.greenBg, marginRight: 8 }]}>
              <View style={styles.pillBoxTitleRow}>
                <Check color={C.green} size={13} />
                <Text style={[styles.pillBoxTitle, { color: C.green }]}> Your strengths</Text>
              </View>
              <View style={styles.pillWrap}>
                {(strongDims.length ? strongDims : [{ name: 'None yet' } as { name: string }]).map((d, i) => (
                  <View key={i} style={[styles.tagPill, { borderColor: C.greenBorder, backgroundColor: C.white }]}>
                    <Text style={[styles.tagPillText, { color: C.green }]}>{d.name}</Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.pillBox, { backgroundColor: C.goldBg, marginLeft: 8 }]}>
              <View style={styles.pillBoxTitleRow}>
                <Warn color={C.gold} size={13} />
                <Text style={[styles.pillBoxTitle, { color: C.gold }]}> Areas to improve</Text>
              </View>
              <View style={styles.pillWrap}>
                {(weakDims.length ? weakDims : [{ name: 'None' } as { name: string }]).map((d, i) => (
                  <View key={i} style={[styles.tagPill, { borderColor: C.goldBorder, backgroundColor: C.white }]}>
                    <Text style={[styles.tagPillText, { color: C.gold }]}>{d.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
        <Footer page={4} />
      </Page>

      {/* ── AI INSIGHTS ── */}
      {aiRecommendation && (
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <SectionHeader num="03" title="AI-Powered Insights" sub="Generated for your context" />

            <View style={styles.insightCard}>
              <View style={[styles.insightHeader, { backgroundColor: C.green }]}>
                <Check color={C.white} size={14} />
                <Text style={styles.insightHeaderText}> Key strengths</Text>
              </View>
              <View style={styles.insightBody}>
                {aiRecommendation.strengths.map((s, i) => (
                  <View key={i} style={styles.insightItem}>
                    <View style={styles.insightMark}>
                      <Check color={C.green} size={12} />
                    </View>
                    <Text style={styles.insightText}>{noEmDash(s)}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.insightCard}>
              <View style={[styles.insightHeader, { backgroundColor: C.red }]}>
                <Warn color={C.white} size={14} />
                <Text style={styles.insightHeaderText}> Critical gaps to address</Text>
              </View>
              <View style={styles.insightBody}>
                {aiRecommendation.gaps.map((g, i) => (
                  <View key={i} style={styles.insightItem}>
                    <View style={styles.insightMark}>
                      <Warn color={C.red} size={12} />
                    </View>
                    <Text style={styles.insightText}>{noEmDash(g)}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
          <Footer page={5} />
        </Page>
      )}

      {/* ── ACTION PLAN ── */}
      {aiRecommendation && (
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <SectionHeader num="04" title="Your Action Plan" sub="Where to focus before you spend" />

            {priorities.length > 0 ? (
              priorities.map((para, i) => (
                <View key={i} style={styles.priorityCard}>
                  <View style={styles.priorityHead}>
                    <View style={[styles.priorityNum, { backgroundColor: i === 0 ? C.blue : C.gold }]}>
                      <Text style={styles.priorityNumText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.priorityTitle}>Priority {i + 1}</Text>
                  </View>
                  <Text style={styles.body}>{para}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.body}>{aiRecommendation.personalizedPlan}</Text>
            )}

            <View style={[styles.callout, { marginTop: 8, marginBottom: 0 }]}>
              <Text style={styles.body}>
                <Text style={{ fontFamily: 'Montserrat', fontWeight: 700 }}>The test that matters. </Text>
                Work these priorities before committing real money. Doing the hard validation now
                is what turns this idea into a venture and moves you from {meta.label.toLowerCase()} to green.
              </Text>
            </View>
          </View>
          <Footer page={6} />
        </Page>
      )}

      {/* ── ROADMAP (paginated) ── */}
      {roadmapPages.map((weeks, pageIdx) => (
        <Page key={pageIdx} size="A4" style={styles.page}>
          <View style={styles.content}>
            <SectionHeader
              num="05"
              title="Weekly Roadmap"
              sub={
                roadmapPages.length > 1
                  ? `Weeks ${pageIdx * 4 + 1} to ${pageIdx * 4 + weeks.length}`
                  : 'A week-by-week execution plan'
              }
            />
            <View style={styles.weekGrid}>
              {weeks.map((w) => (
                <View key={w.week} style={styles.weekCard}>
                  <View style={styles.weekHead}>
                    <View style={styles.weekBadge}>
                      <Text style={styles.weekBadgeText}>{String(w.week).padStart(2, '0')}</Text>
                    </View>
                    <Text style={styles.weekTitle}>Week {w.week}</Text>
                  </View>
                  {w.tasks.map((t, i) => (
                    <View key={i} style={styles.weekTask}>
                      <View style={styles.weekDot} />
                      <Text style={styles.weekTaskText}>{noEmDash(t)}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>
          <Footer page={7 + pageIdx} />
        </Page>
      ))}

      {/* ── RESOURCES ── */}
      {aiRecommendation && aiRecommendation.resources.length > 0 && (
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <SectionHeader num="06" title="Recommended Resources" sub="Curated for your context" />
            <View style={styles.resGrid}>
              {aiRecommendation.resources.map((r, i) => (
                <View key={i} style={styles.resCard}>
                  <View style={styles.resBadge}>
                    <Text style={styles.resBadgeText}>{String(i + 1).padStart(2, '0')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resTitle}>{noEmDash(r.title)}</Text>
                    <Text style={styles.resDesc}>{noEmDash(r.description)}</Text>
                    {r.link ? (
                      <Text style={[styles.resDesc, { color: C.blue, fontFamily: 'Montserrat', fontWeight: 700 }]}>
                        {r.link}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>
          </View>
          <Footer page={9} />
        </Page>
      )}

      {/* ── RISK ASSESSMENT ── */}
      {aiRecommendation && (
        <Page size="A4" style={styles.page}>
          <View style={styles.content}>
            <SectionHeader num="07" title="Risk Assessment" sub="A frank, honest read" />

            <View style={styles.frankBox}>
              <Text style={styles.frankLabel}>FRANK ASSESSMENT</Text>
              <Text style={styles.frankText}>{noEmDash(aiRecommendation.riskAssessment)}</Text>
            </View>

            {aiRecommendation.gaps.length > 0 && (
              <>
                <Text style={styles.riskLabel}>CRITICAL RISKS</Text>
                {aiRecommendation.gaps.slice(0, 4).map((g, i) => (
                  <View key={i} style={styles.riskRow}>
                    <Text style={styles.riskNum}>{String(i + 1).padStart(2, '0')}</Text>
                    <View style={styles.riskTextWrap}>
                      <View style={styles.riskUnderline} />
                      <Text style={styles.riskText}>{noEmDash(g)}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            <View style={styles.mitiBox}>
              <Text style={styles.mitiLabel}>BOTTOM LINE</Text>
              <Text style={styles.body}>
                {scoreResult.summary ||
                  `You have ${positive} of ${total} indicators in place. Do the hard validation work first. It is cheaper to fail at validation than to build a product nobody buys.`}
              </Text>
            </View>
          </View>
          <Footer page={10} />
        </Page>
      )}

      {/* ── CTA ── */}
      <Page size="A4" style={styles.ctaPage}>
        <View fixed style={{ position: 'absolute', top: 0, left: 0, width: 595, height: 842 }}>
          <Svg width={595} height={842}>
            <Line x1={430} y1={120} x2={650} y2={560} stroke="#23467C" strokeWidth={2} />
            <Line x1={520} y1={140} x2={320} y2={640} stroke="#21437A" strokeWidth={2} />
          </Svg>
        </View>

        <View style={styles.coverLogoBox}>
          {LOGO_DATA ? <Image src={{ data: LOGO_DATA, format: 'png' }} style={styles.coverLogo} /> : null}
        </View>
        <Text style={styles.ctaTitle}>Ready to take action?</Text>
        <Text style={styles.ctaIntro}>
          Based on your results, BeamX Solutions can help you close the gaps and move from
          {' '}{meta.label} to a confident launch.
        </Text>

        <View style={styles.ctaCard}>
          <Text style={styles.ctaCardTitle}>Free 30-min consultation</Text>
          <Text style={styles.ctaCardDesc}>We help you implement the recommendations in this report.</Text>
          <Text style={styles.ctaCardLink}>www.beamxsolutions.com</Text>
        </View>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaCardTitle}>1-on-1 validation session</Text>
          <Text style={styles.ctaCardDesc}>Pressure-test your idea with our team.</Text>
          <Text style={styles.ctaCardLink}>calendly.com/beamx-solutions</Text>
        </View>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaCardTitle}>Email us</Text>
          <Text style={styles.ctaCardDesc}>Questions or ready to start? Reach out directly.</Text>
          <Text style={styles.ctaCardLink}>info@beamxsolutions.com</Text>
        </View>

        <View style={styles.ctaFooter}>
          <Text style={styles.ctaFooterText}>
            © 2026 BeamX Solutions. All rights reserved. · www.beamxsolutions.com
          </Text>
        </View>
      </Page>
    </Document>
  );
};
