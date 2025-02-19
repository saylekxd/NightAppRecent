import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Modal, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getPointsBalance } from '@/lib/points';
import { Reward, RewardRedemption, getAvailableRewards, redeemReward, getUserRedemptions } from '@/lib/rewards';
import QRCode from 'react-native-qrcode-svg';

export default function RewardsScreen() {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptions, setRedemptions] = useState<(RewardRedemption & { reward: Reward })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedemptionModal, setShowRedemptionModal] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [redemptionResult, setRedemptionResult] = useState<(RewardRedemption & { reward: Reward }) | null>(null);
  const [showUsedCoupons, setShowUsedCoupons] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
  }, []);

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
      startRotation();
      const [pointsData, rewardsData, redemptionsData] = await Promise.all([
        getPointsBalance(),
        getAvailableRewards(),
        getUserRedemptions(),
      ]);
      setPoints(pointsData);
      setRewards(rewardsData);
      setRedemptions(redemptionsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleRedeem = async (reward: Reward) => {
    try {
      // Check if user already has an active redemption for this reward
      const existingRedemption = redemptions.find(
        r => r.reward.id === reward.id && r.status === 'active' && new Date(r.expires_at) > new Date()
      );

      if (existingRedemption) {
        setError('You already have an active redemption for this reward');
        return;
      }

      setError(null);
      setRedeeming(true);
      setSelectedReward(reward);
      const redemption = await redeemReward(reward.id);
      setRedemptionResult(redemption);
      setShowRedemptionModal(true);
      await loadData(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setRedeeming(false);
    }
  };

  const activeRedemptions = redemptions.filter(r => r.status === 'active' && new Date(r.expires_at) > new Date());
  const usedRedemptions = redemptions.filter(r => r.status === 'used' || r.status === 'expired' || new Date(r.expires_at) <= new Date());

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <View style={styles.headerActions}>
          <View style={styles.pointsInfo}>
            <Ionicons name="star" size={20} color="#ff3b7f" />
            <Text style={styles.pointsText}>{points} points</Text>
          </View>
          <Pressable 
            style={[styles.refreshButton, loading && styles.refreshButtonLoading]}
            onPress={loadData}
            disabled={loading}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="refresh" size={20} color="#fff" />
            </Animated.View>
          </Pressable>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      <View style={[styles.section, loading && styles.sectionLoading]}>
        <Text style={styles.sectionTitle}>Available Rewards</Text>
        {rewards.map((reward) => {
          const hasActiveRedemption = redemptions.some(
            r => r.reward.id === reward.id && r.status === 'active' && new Date(r.expires_at) > new Date()
          );

          return (
            <View key={reward.id} style={styles.rewardCard}>
              <Image source={{ uri: reward.image_url }} style={styles.rewardImage} />
              <View style={styles.rewardInfo}>
                <Text style={styles.rewardTitle}>{reward.title}</Text>
                <Text style={styles.rewardDescription}>{reward.description}</Text>
                <View style={styles.rewardPoints}>
                  <Ionicons name="star" size={16} color="#ff3b7f" />
                  <Text style={styles.pointsRequired}>{reward.points_required} points</Text>
                </View>
                <Pressable
                  style={[
                    styles.redeemButton,
                    (points < reward.points_required || hasActiveRedemption) && styles.redeemButtonDisabled
                  ]}
                  onPress={() => handleRedeem(reward)}
                  disabled={points < reward.points_required || hasActiveRedemption || redeeming}>
                  <Text style={styles.redeemButtonText}>
                    {redeeming && selectedReward?.id === reward.id
                      ? 'Redeeming...'
                      : hasActiveRedemption
                      ? 'Already Redeemed'
                      : points < reward.points_required
                      ? 'Not Enough Points'
                      : 'Redeem Reward'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {activeRedemptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Coupons</Text>
          {activeRedemptions.map((redemption) => (
            <View key={redemption.id} style={styles.redemptionCard}>
              <Image source={{ uri: redemption.reward.image_url }} style={styles.redemptionImage} />
              <View style={styles.redemptionInfo}>
                <View>
                  <Text style={styles.redemptionTitle}>{redemption.reward.title}</Text>
                  <View style={styles.redemptionStatus}>
                    <View style={[styles.statusBadge, styles.statusActive]}>
                      <Text style={styles.statusText}>Active</Text>
                    </View>
                    <Text style={styles.expiryText}>
                      Expires: {new Date(redemption.expires_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Pressable 
                  style={styles.viewCodeButton}
                  onPress={() => {
                    setRedemptionResult(redemption);
                    setShowRedemptionModal(true);
                  }}>
                  <Text style={styles.viewCodeButtonText}>View Code</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}

      {usedRedemptions.length > 0 && (
        <View style={styles.section}>
          <Pressable 
            style={styles.usedCouponsHeader}
            onPress={() => setShowUsedCoupons(!showUsedCoupons)}>
            <Text style={styles.sectionTitle}>Past Coupons</Text>
            <Ionicons 
              name={showUsedCoupons ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color="#fff" 
            />
          </Pressable>
          
          {showUsedCoupons && usedRedemptions.map((redemption) => (
            <View key={redemption.id} style={[styles.redemptionCard, styles.usedRedemptionCard]}>
              <Image 
                source={{ uri: redemption.reward.image_url }} 
                style={[styles.redemptionImage, styles.usedRedemptionImage]} 
              />
              <View style={styles.redemptionInfo}>
                <Text style={[styles.redemptionTitle, styles.usedRedemptionTitle]}>
                  {redemption.reward.title}
                </Text>
                <View style={styles.redemptionStatus}>
                  <View style={[
                    styles.statusBadge,
                    redemption.status === 'used' ? styles.statusUsed : styles.statusExpired
                  ]}>
                    <Text style={styles.statusText}>
                      {redemption.status === 'used' ? 'Used' : 'Expired'}
                    </Text>
                  </View>
                  <Text style={styles.expiryText}>
                    {new Date(redemption.expires_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      <Modal
        visible={showRedemptionModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedemptionModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reward Redeemed!</Text>
            {redemptionResult && (
              <>
                <Text style={styles.modalSubtitle}>{redemptionResult.reward.title}</Text>
                <View style={styles.qrContainer}>
                  <QRCode
                    value={redemptionResult.code}
                    size={200}
                    color="#000"
                    backgroundColor="#fff"
                  />
                </View>
                <Text style={styles.codeText}>{redemptionResult.code}</Text>
                <Text style={styles.modalInfo}>
                  Show this code to redeem your reward.{'\n'}
                  Valid until: {new Date(redemptionResult.expires_at).toLocaleDateString()}
                </Text>
              </>
            )}
            <Pressable
              style={styles.modalButton}
              onPress={() => setShowRedemptionModal(false)}>
              <Text style={styles.modalButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 20,
  },
  pointsText: {
    color: '#ff3b7f',
    marginLeft: 5,
    fontWeight: '600',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  rewardCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 160,
  },
  rewardImage: {
    width: 120,
    height: '100%',
  },
  rewardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  rewardDescription: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 4,
    fontSize: 13,
    lineHeight: 16,
    maxHeight: 48,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  pointsRequired: {
    color: '#ff3b7f',
    marginLeft: 5,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: '#ff3b7f',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: '#666',
  },
  redeemButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  redemptionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    height: 120,
  },
  redemptionImage: {
    width: 100,
    height: '100%',
  },
  redemptionInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  redemptionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  redemptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusActive: {
    backgroundColor: '#4CAF50',
  },
  statusUsed: {
    backgroundColor: '#666',
  },
  statusExpired: {
    backgroundColor: '#F44336',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  expiryText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 20,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 20,
  },
  modalInfo: {
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButton: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 15,
    alignItems: 'center',
  },
  errorText: {
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 15,
  },
  retryButton: {
    backgroundColor: '#ff3b7f',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  usedCouponsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewCodeButton: {
    backgroundColor: '#ff3b7f',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewCodeButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  usedRedemptionCard: {
    opacity: 0.7,
  },
  usedRedemptionImage: {
    opacity: 0.5,
  },
  usedRedemptionTitle: {
    opacity: 0.8,
  },
  redemptionCode: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  codeLabel: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
    fontSize: 14,
  },
  codeText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  refreshButton: {
    backgroundColor: '#1a1a1a',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButtonLoading: {
    backgroundColor: '#2a2a2a',
  },
  sectionLoading: {
    opacity: 0.7,
  },
});