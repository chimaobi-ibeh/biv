import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
import { AssessmentResult } from '@/types';

// Logo URL - use logo-white for dark backgrounds
const LOGO_WHITE_URL = 'https://stellar.beamxsolutions.com/logo-white.png';

// DESIGN SYSTEM - Professional Color Palette
const COLORS = {
  primary: '#0066CC',
  secondary: '#FF8C00',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  gray50: '#F9FAFB',
  gray100: '#E5E7EB',
  gray200: '#D1D5DB',
  gray400: '#9CA3AF',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
  darkBlue: '#003D82',
};

const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

const FONT_SIZES = {
  xs: 8,
  sm: 9,
  base: 10,
  md: 11,
  lg: 12,
  xl: 14,
  xxl: 18,
  xxxl: 24,
  huge: 32,
  display: 40,
};

const styles = StyleSheet.create({
  // Cover Page
  coverPage: {
    backgroundColor: COLORS.white,
    position: 'relative',
    fontFamily: 'Helvetica',
  },
  coverImageSection: {
    height: 200,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverLogo: {
    width: 200,
    height: 60,
  },
  coverTitleSection: {
    backgroundColor: COLORS.darkBlue,
    paddingVertical: SPACING.huge,
    paddingHorizontal: SPACING.huge,
  },
  coverTitle: {
    fontSize: FONT_SIZES.display,
    fontWeight: 700,
    color: COLORS.white,
    lineHeight: 1.2,
    marginBottom: SPACING.sm,
  },
  coverSubtitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 700,
    color: COLORS.white,
    lineHeight: 1.2,
  },
  coverFooter: {
    position: 'absolute',
    bottom: SPACING.huge,
    left: SPACING.huge,
  },
  coverFooterLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
    marginBottom: SPACING.xs,
  },
  coverFooterValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 700,
    color: COLORS.gray900,
    marginBottom: SPACING.lg,
  },

  // Standard Page
  standardPage: {
    padding: SPACING.huge,
    fontFamily: 'Helvetica',
  },
  pageHeader: {
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
    paddingBottom: SPACING.md,
    marginBottom: SPACING.xxl,
  },
  pageHeaderText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 700,
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  pageFooter: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.huge,
    right: SPACING.huge,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
    paddingTop: SPACING.sm,
  },
  pageFooterText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray400,
  },

  // Score Card Section (matching web UI)
  scoreCard: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    padding: SPACING.xxl,
    marginBottom: SPACING.xxl,
    alignItems: 'center',
  },
  scoreCardTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 700,
    color: COLORS.white,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  scoreCardName: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SPACING.lg,
  },
  scoreCardNumber: {
    fontSize: 72,
    fontWeight: 700,
    color: COLORS.white,
  },
  scoreCardMax: {
    fontSize: FONT_SIZES.xxl,
    color: COLORS.white,
    opacity: 0.9,
  },
  scoreCardLevel: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 700,
    color: COLORS.white,
    marginTop: SPACING.md,
  },
  scoreCardProgress: {
    width: '80%',
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 6,
    marginTop: SPACING.lg,
    overflow: 'hidden',
  },
  scoreCardProgressBar: {
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 6,
  },
  scoreCardReadyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.white,
    marginTop: SPACING.sm,
  },

  // Readiness Breakdown Section
  breakdownSection: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: SPACING.xxl,
    marginBottom: SPACING.xxl,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  breakdownTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 700,
    color: COLORS.gray900,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  breakdownItem: {
    marginBottom: SPACING.lg,
  },
  breakdownItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  breakdownItemTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 700,
    color: COLORS.gray800,
  },
  breakdownItemDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginBottom: SPACING.sm,
  },
  breakdownItemScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownItemScoreText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    marginRight: SPACING.md,
  },
  breakdownItemBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    minWidth: 50,
  },
  breakdownItemBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 700,
    color: COLORS.white,
    textAlign: 'center',
  },
  breakdownProgressBar: {
    height: 10,
    backgroundColor: COLORS.gray200,
    borderRadius: 5,
    overflow: 'hidden',
  },
  breakdownProgressFill: {
    height: '100%',
    borderRadius: 5,
  },

  // Section styles
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 700,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },

  // Cards
  card: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.lg,
    borderRadius: 4,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
  },
  cardSuccess: {
    borderLeftColor: COLORS.success,
  },

  // Text Styles
  textBody: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray700,
    lineHeight: 1.6,
    marginBottom: SPACING.sm,
  },
  textBold: {
    fontWeight: 700,
  },

  // List Styles
  listItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    paddingLeft: SPACING.sm,
  },
  listBullet: {
    width: 16,
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    marginRight: SPACING.sm,
    fontWeight: 700,
  },
  listContent: {
    flex: 1,
    fontSize: FONT_SIZES.base,
    color: COLORS.gray800,
    lineHeight: 1.5,
  },

  // Week Header
  weekHeader: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  weekHeaderText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 700,
    color: COLORS.white,
  },

  // CTA Page
  ctaPage: {
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.huge,
    fontFamily: 'Helvetica',
  },
  ctaCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.huge,
    borderRadius: 8,
    width: '100%',
    maxWidth: 400,
  },
  ctaTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 700,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  ctaSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
  },
  ctaContactSection: {
    marginTop: SPACING.xxl,
  },
  ctaContactItem: {
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  ctaContactLabel: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray900,
    fontWeight: 700,
  },
  ctaFooter: {
    position: 'absolute',
    bottom: SPACING.xl,
    left: 0,
    right: 0,
    textAlign: 'center',
  },
  ctaFooterText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
  },
});

// Helper functions
const getStatusColor = (level: string): string => {
  const levelLower = level.toLowerCase();
  if (levelLower.includes('green')) return COLORS.success;
  if (levelLower.includes('yellow')) return COLORS.warning;
  if (levelLower.includes('orange')) return COLORS.warning;
  if (levelLower.includes('red')) return COLORS.danger;
  return COLORS.gray400;
};

const getBarColor = (percentage: number): string => {
  if (percentage >= 75) return COLORS.success;
  if (percentage >= 50) return COLORS.warning;
  return COLORS.danger;
};

interface PDFDocumentProps {
  result: AssessmentResult;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ result }) => {
  const { scoreResult, dimensionScores, aiRecommendation, userProfile } = result;
  const statusColor = getStatusColor(scoreResult.level);
  const scorePercentage = scoreResult.score;
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        <View style={styles.coverImageSection}>
          <Image src={LOGO_WHITE_URL} style={styles.coverLogo} />
        </View>

        <View style={styles.coverTitleSection}>
          <Text style={styles.coverTitle}>Business Idea</Text>
          <Text style={styles.coverSubtitle}>Validation Report</Text>
        </View>

        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterLabel}>Prepared For</Text>
          <Text style={styles.coverFooterValue}>{userProfile.name || 'Entrepreneur'}</Text>

          <Text style={styles.coverFooterLabel}>Generated on</Text>
          <Text style={styles.coverFooterValue}>{reportDate}</Text>
        </View>
      </Page>

      {/* SCORE & BREAKDOWN PAGE */}
      <Page size="A4" style={styles.standardPage}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderText}>Your Business Idea Assessment</Text>
        </View>

        {/* Score Card - matching web UI */}
        <View style={[styles.scoreCard, { backgroundColor: statusColor }]}>
          <Text style={styles.scoreCardTitle}>Your Business Idea Assessment</Text>
          {userProfile.name && (
            <Text style={styles.scoreCardName}>{userProfile.name}</Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
            <Text style={styles.scoreCardNumber}>{scoreResult.totalPositive}</Text>
            <Text style={styles.scoreCardMax}> / 10</Text>
          </View>
          <Text style={styles.scoreCardLevel}>{scoreResult.level}</Text>
          <View style={styles.scoreCardProgress}>
            <View style={[styles.scoreCardProgressBar, { width: `${scorePercentage}%` }]} />
          </View>
          <Text style={styles.scoreCardReadyText}>{scorePercentage}% Ready</Text>
        </View>

        {/* Readiness Breakdown - matching web UI */}
        <View style={styles.breakdownSection}>
          <Text style={styles.breakdownTitle}>Your Readiness Breakdown</Text>

          {dimensionScores.map((dim, idx) => {
            const percentage = dim.maxScore > 0 ? Math.round((dim.score / dim.maxScore) * 100) : 0;
            const barColor = getBarColor(percentage);

            return (
              <View key={idx} style={styles.breakdownItem}>
                <View style={styles.breakdownItemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.breakdownItemTitle}>{dim.name}</Text>
                  </View>
                  <View style={styles.breakdownItemScoreContainer}>
                    <Text style={styles.breakdownItemScoreText}>{dim.score}/{dim.maxScore}</Text>
                    <View style={[styles.breakdownItemBadge, { backgroundColor: barColor }]}>
                      <Text style={styles.breakdownItemBadgeText}>{percentage}%</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.breakdownProgressBar}>
                  <View style={[styles.breakdownProgressFill, { width: `${percentage}%`, backgroundColor: barColor }]} />
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Business Assessment Report</Text>
          <Text style={styles.pageFooterText}>Copyright © 2026 BeamX Solutions</Text>
        </View>
      </Page>

      {/* AI RECOMMENDATIONS - Combined into one page */}
      {aiRecommendation && (
        <Page size="A4" style={styles.standardPage}>
          <View style={styles.pageHeader}>
            <Text style={styles.pageHeaderText}>AI Recommendations</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Your Strengths</Text>
            {aiRecommendation.strengths.slice(0, 3).map((strength, idx) => (
              <View key={idx} style={[styles.card, styles.cardSuccess]}>
                <Text style={[styles.textBody, styles.textBold]}>• {strength}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Personalized Plan</Text>
            <Text style={styles.textBody}>{aiRecommendation.personalizedPlan}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionSubtitle}>Week-by-Week Roadmap</Text>
            {aiRecommendation.weeklyRoadmap.slice(0, 2).map((week) => (
              <View key={week.week} style={{ marginBottom: SPACING.md }}>
                <View style={styles.weekHeader}>
                  <Text style={styles.weekHeaderText}>Week {week.week}</Text>
                </View>
                {week.tasks.slice(0, 3).map((task, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.listContent}>{task}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>

          <View style={styles.pageFooter}>
            <Text style={styles.pageFooterText}>Business Assessment Report</Text>
            <Text style={styles.pageFooterText}>Copyright © 2026 BeamX Solutions</Text>
          </View>
        </Page>
      )}

      {/* CALL TO ACTION */}
      <Page size="A4" style={styles.ctaPage}>
        <View style={styles.ctaCard}>
          <Text style={styles.ctaTitle}>Ready to Take Action?</Text>
          <Text style={styles.ctaSubtitle}>
            Based on your assessment results, BeamX Solutions can help you implement the strategic
            recommendations outlined above.
          </Text>

          <View style={styles.ctaContactSection}>
            <View style={styles.ctaContactItem}>
              <Text style={styles.ctaContactLabel}>www.beamxsolutions.com</Text>
            </View>
            <View style={styles.ctaContactItem}>
              <Text style={styles.ctaContactLabel}>info@beamxsolutions.com</Text>
            </View>
            <View style={styles.ctaContactItem}>
              <Text style={styles.ctaContactLabel}>https://calendly.com/beamxsolutions</Text>
            </View>
          </View>
        </View>

        <View style={styles.ctaFooter}>
          <Text style={styles.ctaFooterText}>© 2026 BeamX Solutions. All rights reserved.</Text>
        </View>
      </Page>
    </Document>
  );
};
