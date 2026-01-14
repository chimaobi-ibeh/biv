import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';
import { AssessmentResult } from '@/types';

// Register fonts for better typography
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'Helvetica', fontWeight: 400 },
    { src: 'Helvetica-Bold', fontWeight: 700 },
  ],
});

// DESIGN SYSTEM - Professional Color Palette
const COLORS = {
  primary: '#0066CC', // Professional Blue
  secondary: '#FF8C00', // Orange accent
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

// Comprehensive StyleSheet
const styles = StyleSheet.create({
  // Page Layouts
  page: {
    backgroundColor: COLORS.white,
    fontFamily: 'Helvetica',
    fontSize: FONT_SIZES.base,
    color: COLORS.gray800,
  },

  coverPage: {
    backgroundColor: COLORS.white,
    position: 'relative',
  },

  // Cover Page - Top Image Section
  coverImageSection: {
    height: 200,
    backgroundColor: COLORS.primary,
    position: 'relative',
  },
  coverLogo: {
    position: 'absolute',
    top: SPACING.xl,
    left: SPACING.huge,
  },
  coverLogoText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 700,
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  coverLogoSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.white,
    letterSpacing: 2,
    marginTop: SPACING.xs,
  },

  // Cover Title Section
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

  // Cover Footer
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
  },

  // Page Header
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

  // Page Footer
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

  // Icon Card Layout (4-column)
  iconCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xxl,
    backgroundColor: COLORS.offWhite,
    padding: SPACING.xxl,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  iconCard: {
    width: '22%',
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconText: {
    fontSize: FONT_SIZES.xxxl,
    color: COLORS.secondary,
  },
  iconLabel: {
    fontSize: FONT_SIZES.md,
    fontWeight: 700,
    color: COLORS.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  iconValue: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 700,
    color: COLORS.gray900,
    textAlign: 'center',
  },

  // Section Headers
  section: {
    marginBottom: SPACING.xxl,
  },
  sectionHeader: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 700,
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 700,
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },

  // Score Display
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    backgroundColor: COLORS.white,
    padding: SPACING.xxl,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xxl,
  },
  scoreNumber: {
    fontSize: FONT_SIZES.huge,
    fontWeight: 700,
    color: COLORS.primary,
  },
  scoreLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray600,
    marginTop: SPACING.xs,
  },
  scoreSummary: {
    flex: 1,
  },
  scoreSummaryTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 700,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
  },

  // Table Styles
  table: {
    width: '100%',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  tableHeaderCell: {
    fontSize: FONT_SIZES.md,
    fontWeight: 700,
    color: COLORS.white,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  tableRowAlt: {
    backgroundColor: COLORS.gray50,
  },
  tableCell: {
    fontSize: FONT_SIZES.base,
    color: COLORS.gray800,
  },
  tableCellBold: {
    fontSize: FONT_SIZES.base,
    fontWeight: 700,
    color: COLORS.gray900,
  },

  // Cards
  card: {
    backgroundColor: COLORS.gray50,
    padding: SPACING.lg,
    borderRadius: 4,
    marginBottom: SPACING.md,
    borderLeftWidth: 4,
  },
  cardPrimary: {
    borderLeftColor: COLORS.primary,
  },
  cardSecondary: {
    borderLeftColor: COLORS.secondary,
  },
  cardSuccess: {
    borderLeftColor: COLORS.success,
  },
  cardWarning: {
    borderLeftColor: COLORS.warning,
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
  textSmall: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray600,
    lineHeight: 1.5,
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

  // Insight Boxes
  insightBox: {
    backgroundColor: COLORS.offWhite,
    padding: SPACING.lg,
    borderRadius: 4,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  insightTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 700,
    color: COLORS.gray900,
    marginBottom: SPACING.sm,
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

const getStatusText = (level: string): string => {
  if (level.includes('Light')) return level;
  const levelLower = level.toLowerCase();
  if (levelLower === 'green') return 'Green Light';
  if (levelLower === 'yellow') return 'Yellow Light';
  if (levelLower === 'red') return 'Red Light';
  return 'Assessment';
};

interface PDFDocumentProps {
  result: AssessmentResult;
}

export const PDFDocument: React.FC<PDFDocumentProps> = ({ result }) => {
  const { scoreResult, dimensionScores, aiRecommendation, userProfile } = result;
  const statusColor = getStatusColor(scoreResult.level);
  const statusText = getStatusText(scoreResult.level);
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Document>
      {/* COVER PAGE */}
      <Page size="A4" style={styles.coverPage}>
        {/* Top colored section with logo */}
        <View style={styles.coverImageSection}>
          <View style={styles.coverLogo}>
            <Text style={styles.coverLogoText}>BEAMX</Text>
            <Text style={styles.coverLogoSubtext}>SOLUTIONS</Text>
          </View>
        </View>

        {/* Title section */}
        <View style={styles.coverTitleSection}>
          <Text style={styles.coverTitle}>Business Idea</Text>
          <Text style={styles.coverSubtitle}>Validation Report</Text>
        </View>

        {/* Footer info */}
        <View style={styles.coverFooter}>
          <Text style={styles.coverFooterLabel}>Prepared By</Text>
          <Text style={styles.coverFooterValue}>BeamX Solutions</Text>

          <Text style={styles.coverFooterLabel}>Generated on</Text>
          <Text style={styles.coverFooterValue}>{reportDate}</Text>
        </View>
      </Page>

      {/* EXECUTIVE SUMMARY */}
      <Page size="A4" style={styles.standardPage}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageHeaderText}>Executive Summary</Text>
        </View>

        {/* Icon Cards Row */}
        <View style={styles.iconCardRow}>
          <View style={styles.iconCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <Text style={styles.iconLabel}>Industry</Text>
            <Text style={styles.iconValue}>{userProfile.industry || 'N/A'}</Text>
          </View>

          <View style={styles.iconCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🎯</Text>
            </View>
            <Text style={styles.iconLabel}>Stage</Text>
            <Text style={styles.iconValue}>{userProfile.stage || 'N/A'}</Text>
          </View>

          <View style={styles.iconCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📍</Text>
            </View>
            <Text style={styles.iconLabel}>Location</Text>
            <Text style={styles.iconValue}>{userProfile.location || 'N/A'}</Text>
          </View>

          <View style={styles.iconCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>💡</Text>
            </View>
            <Text style={styles.iconLabel}>Score</Text>
            <Text style={styles.iconValue}>{scoreResult.score}%</Text>
          </View>
        </View>

        {/* Overall Assessment Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overall Assessment</Text>
        </View>

        <View style={styles.scoreDisplay}>
          <View style={[styles.scoreCircle, { borderColor: statusColor }]}>
            <Text style={styles.scoreNumber}>{scoreResult.score}</Text>
            <Text style={styles.scoreLabel}>/100</Text>
          </View>
          <View style={styles.scoreSummary}>
            <Text style={styles.scoreSummaryTitle}>Status: {statusText}</Text>
            <Text style={styles.textBody}>{scoreResult.summary}</Text>
            <Text style={[styles.textBody, styles.textBold]}>
              Timeframe: {scoreResult.timeframe}
            </Text>
          </View>
        </View>

        {/* Dimension Scores Table */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Detailed Score Breakdown</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, { width: '40%' }]}>Category</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Your Score</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Max Score</Text>
            <Text style={[styles.tableHeaderCell, { width: '20%' }]}>Percentage</Text>
          </View>
          {dimensionScores.map((dim, idx) => {
            const progress = dim.maxScore > 0 ? Math.round((dim.score / dim.maxScore) * 100) : 0;

            return (
              <View key={idx} style={idx % 2 === 1 ? [styles.tableRow, styles.tableRowAlt] : styles.tableRow}>
                <Text style={[styles.tableCellBold, { width: '40%' }]}>{dim.name}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{dim.score}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{dim.maxScore}</Text>
                <Text style={[styles.tableCellBold, { width: '20%' }]}>{progress}%</Text>
              </View>
            );
          })}
        </View>

        <View style={styles.pageFooter}>
          <Text style={styles.pageFooterText}>Business Assessment Report</Text>
          <Text style={styles.pageFooterText}>Copyright © 2025 BeamXSolutions</Text>
        </View>
      </Page>

      {/* AI RECOMMENDATIONS */}
      {aiRecommendation && (
        <>
          {/* STRATEGIC INSIGHTS */}
          <Page size="A4" style={styles.standardPage}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageHeaderText}>Strategic Advisory & Recommendations</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionSubtitle}>Strategic Insights</Text>

              {aiRecommendation.strengths.slice(0, 3).map((strength, idx) => (
                <View key={idx} style={[styles.card, styles.cardSuccess]}>
                  <Text style={[styles.textBody, styles.textBold]}>
                    • {strength}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionSubtitle}>Action Steps</Text>

              {aiRecommendation.weeklyRoadmap[0]?.tasks.slice(0, 3).map((task, idx) => (
                <View key={idx} style={styles.listItem}>
                  <Text style={styles.listBullet}>•</Text>
                  <Text style={styles.listContent}>{task}</Text>
                </View>
              ))}
            </View>

            <View style={styles.pageFooter}>
              <Text style={styles.pageFooterText}>Business Assessment Report</Text>
              <Text style={styles.pageFooterText}>Copyright © 2025 BeamXSolutions</Text>
            </View>
          </Page>

          {/* WEEKLY ROADMAP */}
          <Page size="A4" style={styles.standardPage}>
            <View style={styles.pageHeader}>
              <Text style={styles.pageHeaderText}>Your Personalized Roadmap</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.textBody}>{aiRecommendation.personalizedPlan}</Text>
            </View>

            {aiRecommendation.weeklyRoadmap.slice(0, 4).map((week) => (
              <View key={week.week} style={styles.section}>
                <View style={styles.weekHeader}>
                  <Text style={styles.weekHeaderText}>Week {week.week}</Text>
                </View>
                {week.tasks.map((task, idx) => (
                  <View key={idx} style={styles.listItem}>
                    <Text style={styles.listBullet}>•</Text>
                    <Text style={styles.listContent}>{task}</Text>
                  </View>
                ))}
              </View>
            ))}

            <View style={styles.pageFooter}>
              <Text style={styles.pageFooterText}>Business Assessment Report</Text>
              <Text style={styles.pageFooterText}>Copyright © 2025 BeamXSolutions</Text>
            </View>
          </Page>
        </>
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
          <Text style={styles.ctaFooterText}>© 2025 BeamX Solutions. All rights reserved.</Text>
        </View>
      </Page>
    </Document>
  );
};
