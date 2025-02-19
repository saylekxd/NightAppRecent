import { View, Text, StyleSheet, ScrollView, Image, Pressable, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);
      setLoading(true);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#000']}
        style={styles.background}
      />
      
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <View style={styles.pointsInfo}>
          <Ionicons name="star" size={20} color="#ff3b7f" />
          <Text style={styles.pointsText}>{points} points</Text>
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

      <View style={styles.section}>
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

      {redemptions.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Rewards</Text>
          {redemptions.map((redemption) => (
            <View key={redemption.id} style={styles.redemptionCard}>
              <Image source={{ uri: redemption.reward.image_url }} style={styles.redemptionImage} />
              <View style={styles.redemptionInfo}>
                <Text style={styles.redemptionTitle}>{redemption.reward.title}</Text>
                <View style={styles.redemptionStatus}>
                  <View style={[
                    styles.statusBadge,
                    redemption.status === 'active' && styles.statusActive,
                    redemption.status === 'used' && styles.statusUsed,
                    redemption.status === 'expired' && styles.statusExpired,
                  ]}>
                    <Text style={styles.statusText}>{redemption.status}</Text>
                  </View>
                  <Text style={styles.expiryText}>
                    Expires: {new Date(redemption.expires_at).toLocaleDateString()}
                  </Text>
                </View>
                {redemption.status === 'active' && (
                  <View style={styles.redemptionCode}>
                    <Text style={styles.codeLabel}>Redemption Code:</Text>
                    <Text style={styles.codeText}>{redemption.code}</Text>
                  </View>
                )}
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
    marginBottom: 20,
    overflow: 'hidden',
  },
  rewardImage: {
    width: '100%',
    height: 200,
  },
  rewardInfo: {
    padding: 20,
  },
  rewardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  rewardDescription: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 15,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  pointsRequired: {
    color: '#ff3b7f',
    marginLeft: 5,
    fontWeight: '600',
  },
  redeemButton: {
    backgroundColor: '#ff3b7f',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    backgroundColor: '#666',
  },
  redeemButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  redemptionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
  },
  redemptionImage: {
    width: '100%',
    height: 120,
  },
  redemptionInfo: {
    padding: 20,
  },
  redemptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  redemptionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  redemptionCode: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  codeLabel: {
    color: '#fff',
    opacity: 0.8,
    marginBottom: 5,
  },
  codeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
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
});