import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, ViewStyle, DimensionValue, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Constants
const SCREEN_WIDTH = Dimensions.get('window').width;
const QR_SIZE = SCREEN_WIDTH * 0.6;

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export function SkeletonItem({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.bezier(0.4, 0.0, 0.6, 1),
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350],
  });

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          overflow: 'hidden',
        } as ViewStyle,
        style,
      ]}
    >
      <Animated.View
        style={{
          width: '100%',
          height: '100%',
          transform: [{ translateX }],
        }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.1)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ width: '100%', height: '100%' }}
        />
      </Animated.View>
    </View>
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <SkeletonItem height={24} width="60%" style={styles.skeletonMargin} />
      <SkeletonItem height={18} width="80%" style={styles.skeletonMargin} />
      <SkeletonItem height={18} width="40%" style={styles.skeletonMargin} />
    </View>
  );
}

export function ProfileSkeleton() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      <View style={styles.profileContent}>
        <View style={styles.header}>
          <SkeletonItem height={120} width={120} borderRadius={60} style={styles.avatar} />
          <SkeletonItem height={28} width="60%" style={styles.skeletonMargin} />
          <SkeletonItem height={18} width="40%" style={styles.skeletonMargin} />
        </View>
        
        <View style={styles.statsContainer}>
          <SkeletonItem height={80} width="100%" borderRadius={12} style={styles.skeletonMargin} />
        </View>
        
        <View style={styles.section}>
          <SkeletonItem height={24} width="40%" style={styles.skeletonMargin} />
          <View style={styles.profileCardSkeleton}>
            <SkeletonItem height={20} width="70%" style={styles.skeletonMargin} />
            <SkeletonItem height={16} width="90%" style={styles.skeletonMargin} />
            <SkeletonItem height={16} width="40%" />
          </View>
        </View>
        
        <View style={styles.section}>
          <SkeletonItem height={24} width="50%" style={styles.skeletonMargin} />
          <View style={styles.profileCardSkeleton}>
            <SkeletonItem height={20} width="80%" style={styles.skeletonMargin} />
            <SkeletonItem height={16} width="60%" style={styles.skeletonMargin} />
            <SkeletonItem height={40} width="100%" borderRadius={8} />
          </View>
        </View>
        
        <View style={styles.section}>
          <SkeletonItem height={24} width="60%" style={styles.skeletonMargin} />
          <View style={styles.profileCardSkeleton}>
            <SkeletonItem height={20} width="90%" style={styles.skeletonMargin} />
            <SkeletonItem height={16} width="70%" style={styles.skeletonMargin} />
            <SkeletonItem height={16} width="50%" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

export function RewardsSkeleton() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.rewardsHeader}>
        <SkeletonItem height={32} width="40%" style={styles.skeletonMargin} />
        <View style={styles.headerActions}>
          <View style={styles.pointsInfoSkeleton}>
            <SkeletonItem height={20} width={100} borderRadius={20} />
          </View>
          <View style={styles.refreshButtonSkeleton}>
            <SkeletonItem height={40} width={40} borderRadius={20} />
          </View>
        </View>
      </View>
      
      <View style={styles.rewardsSection}>
        <SkeletonItem height={24} width="60%" style={styles.skeletonMargin} />
        
        {[...Array(4)].map((_, index) => (
          <View key={index} style={styles.rewardCardSkeleton}>
            <SkeletonItem height="100%" width={120} style={{ borderRadius: 0 }} />
            <View style={styles.rewardInfoSkeleton}>
              <SkeletonItem height={20} width="70%" style={styles.skeletonMargin} />
              <SkeletonItem height={16} width="90%" style={styles.skeletonMargin} />
              <SkeletonItem height={16} width="40%" style={styles.skeletonMargin} />
              <SkeletonItem height={40} width="100%" borderRadius={8} />
            </View>
          </View>
        ))}
      </View>
      
      <View style={styles.rewardsSection}>
        <SkeletonItem height={24} width="70%" style={styles.skeletonMargin} />
        
        {[...Array(2)].map((_, index) => (
          <View key={index} style={styles.redemptionCardSkeleton}>
            <SkeletonItem height="100%" width={100} style={{ borderRadius: 0 }} />
            <View style={styles.redemptionInfoSkeleton}>
              <SkeletonItem height={20} width="80%" style={styles.skeletonMargin} />
              <View style={styles.redemptionStatusSkeleton}>
                <SkeletonItem height={24} width={80} borderRadius={15} />
                <SkeletonItem height={16} width={100} />
              </View>
              <SkeletonItem height={36} width="50%" borderRadius={8} />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export function QRCodeSkeleton() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.qrContent}>
        <SkeletonItem height={20} width="80%" style={{ alignSelf: 'center', marginBottom: 40 }} />
        
        <View style={styles.qrBoxSkeleton}>
          <SkeletonItem height={QR_SIZE} width={QR_SIZE} borderRadius={12} />
        </View>
        
        <View style={styles.validitySkeleton}>
          <SkeletonItem height={16} width={80} style={styles.skeletonMargin} />
          <SkeletonItem height={20} width={160} />
        </View>
        
        <View style={styles.infoContainerSkeleton}>
          <SkeletonItem height={24} width="50%" style={styles.skeletonMargin} />
          
          {[...Array(3)].map((_, index) => (
            <View key={index} style={styles.infoItemSkeleton}>
              <View style={styles.infoIconSkeleton}>
                <SkeletonItem height={24} width={24} borderRadius={12} />
              </View>
              <SkeletonItem height={16} width="80%" />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export function DashboardSkeleton() {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.dashboardContent}>
        <SkeletonItem height={32} width="50%" style={styles.dashboardTitle} />
        
        <View style={styles.statsGrid}>
          {[...Array(4)].map((_, index) => (
            <View key={index} style={styles.statCardContainer}>
              <SkeletonItem 
                height={100} 
                width="100%" 
                borderRadius={12} 
              />
              <View style={styles.statCardOverlay}>
                <SkeletonItem height={20} width={40} borderRadius={10} style={styles.statCardIcon} />
                <SkeletonItem height={16} width="60%" style={styles.skeletonMargin} />
                <SkeletonItem height={24} width="40%" />
              </View>
            </View>
          ))}
        </View>
        
        <View style={styles.chartSection}>
          <SkeletonItem height={24} width="60%" style={styles.skeletonMargin} />
          <View style={styles.chartContainer}>
            <SkeletonItem height={200} width="100%" borderRadius={12} />
            <View style={styles.chartLegend}>
              <View style={styles.legendItem}>
                <SkeletonItem height={12} width={12} borderRadius={6} />
                <SkeletonItem height={14} width={60} style={{ marginLeft: 8 }} />
              </View>
              <View style={styles.legendItem}>
                <SkeletonItem height={12} width={12} borderRadius={6} />
                <SkeletonItem height={14} width={80} style={{ marginLeft: 8 }} />
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.activitySection}>
          <SkeletonItem height={24} width="70%" style={styles.skeletonMargin} />
          {[...Array(3)].map((_, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIconContainer}>
                <SkeletonItem height={36} width={36} borderRadius={18} />
              </View>
              <View style={styles.activityContent}>
                <SkeletonItem height={16} width="70%" style={styles.skeletonMargin} />
                <SkeletonItem height={14} width="40%" />
              </View>
              <SkeletonItem height={20} width={60} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

export default DashboardSkeleton;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 20,
  },
  avatar: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  skeletonMargin: {
    marginBottom: 12,
  },
  statsContainer: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  rewardsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsInfoSkeleton: {
    marginRight: 12,
  },
  refreshButtonSkeleton: {
    marginLeft: 12,
  },
  rewardsSection: {
    padding: 20,
  },
  rewardCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    height: 160,
    overflow: 'hidden',
    marginBottom: 15,
  },
  rewardInfoSkeleton: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  redemptionCardSkeleton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    height: 120,
    overflow: 'hidden',
    marginBottom: 15,
  },
  redemptionInfoSkeleton: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  redemptionStatusSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  qrContent: {
    padding: 20,
    paddingTop: 60,
  },
  qrBoxSkeleton: {
    alignSelf: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    marginBottom: 30,
  },
  validitySkeleton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  infoContainerSkeleton: {
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 20,
  },
  infoItemSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIconSkeleton: {
    marginRight: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCardContainer: {
    position: 'relative',
    width: '48%',
    marginBottom: 16,
  },
  statCardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 12,
    justifyContent: 'space-between',
  },
  statCardIcon: {
    marginBottom: 10,
  },
  profileContent: {
    padding: 20,
    paddingTop: 60,
  },
  profileCardSkeleton: {
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  dashboardContent: {
    padding: 20,
    paddingTop: 60,
  },
  dashboardTitle: {
    marginBottom: 24,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activitySection: {
    marginBottom: 24,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  activityIconContainer: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
}); 