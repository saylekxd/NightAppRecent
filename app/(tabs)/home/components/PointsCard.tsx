import { View, Text, StyleSheet, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rank, ranks } from '@/lib/ranks';
import { useState } from 'react';

interface PointsCardProps {
  points: number;
  currentRank: Rank | null;
  pointsToNext: number;
  onRefresh: () => void;
}

export function PointsCard({ points, currentRank, pointsToNext, onRefresh }: PointsCardProps) {
  const [showRanksModal, setShowRanksModal] = useState(false);

  const rankDescriptions: { [key: string]: string } = {
    Bronze: "Starter rank for new members.",
    Silver: "Intermediate rank with additional perks.",
    Gold: "Premium benefits unlocked.",
    Platinum: "Advanced privileges available.",
    Diamond: "Exclusive elite membership."
  };

  return (
    <View style={styles.pointsCard}>
      <View style={styles.pointsHeader}>
        <View>
          <Text style={styles.pointsLabel}>Whole Points</Text>
          <Text style={styles.pointsValue}>{points || 0}</Text>
        </View>
        <Pressable 
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={24} color="#ff3b7f" />
        </Pressable>
      </View>
      <Pressable 
        style={styles.tierInfo}
        onPress={() => setShowRanksModal(true)}
      >
        <Ionicons 
          name={currentRank?.icon || "star"} 
          size={20} 
          color={currentRank?.color || "#ff3b7f"} 
        />
        <Text style={[styles.tierText, { color: currentRank?.color || "#ff3b7f" }]}>
          {currentRank?.name || 'Bronze'} Member
        </Text>
        <Ionicons name="information-circle-outline" size={20} color="#fff" style={styles.infoIcon} />
      </Pressable>
      {pointsToNext > 0 && (
        <Text style={styles.nextRankText}>
          {pointsToNext} points until next rank
        </Text>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showRanksModal}
        onRequestClose={() => setShowRanksModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Ranks</Text>
              <Pressable
                onPress={() => setShowRanksModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            {ranks.map((rank) => (
              <View 
                key={rank.name}
                style={[
                  styles.rankItem,
                  currentRank?.name === rank.name && styles.currentRankItem
                ]}
              >
                <View style={styles.rankInfo}>
                  <Ionicons name={rank.icon} size={24} color={rank.color} />
                  <View style={styles.rankDetails}>
                    <Text style={[styles.rankName, { color: rank.color }]}>
                      {rank.name}
                    </Text>
                    <Text style={styles.rankPoints}>
                      {rank.minPoints.toLocaleString()} points required
                    </Text>
                    <Text style={styles.rankInfoText}>
                      {rankDescriptions[rank.name]}
                    </Text>
                  </View>
                </View>
                {currentRank?.name === rank.name && (
                  <Text style={styles.currentBadge}>Current</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  pointsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  pointsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pointsLabel: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 16,
  },
  pointsValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 5,
  },
  refreshButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    borderRadius: 20,
  },
  tierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  tierText: {
    marginLeft: 5,
    fontSize: 16,
    fontWeight: '600',
  },
  nextRankText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginTop: 5,
    textAlign: 'left',
  },
  infoIcon: {
    marginLeft: 8,
    opacity: 0.7,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  currentRankItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankDetails: {
    marginLeft: 12,
  },
  rankName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankPoints: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 14,
    marginTop: 2,
  },
  rankInfoText: {
    color: '#fff',
    opacity: 0.7,
    fontSize: 12,
    marginTop: 4,
  },
  currentBadge: {
    color: '#ff3b7f',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 10,
  },
}); 