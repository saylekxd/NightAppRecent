import { View, Text, StyleSheet, Pressable, Modal, Animated, Easing, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Rank, ranks } from '@/lib/ranks';
import { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

interface PointsCardProps {
  points: number;
  currentRank: Rank | null;
  pointsToNext: number;
  onRefresh: () => void;
  isLoading?: boolean;
}

// Star component for the floating animation
const AnimatedStar = ({ 
  delay, 
  duration, 
  startPosition, 
  size, 
  color 
}: { 
  delay: number; 
  duration: number; 
  startPosition: { x: number; y: number }; 
  size: number;
  color: string;
}) => {
  const positionY = useRef(new Animated.Value(startPosition.y)).current;
  const positionX = useRef(new Animated.Value(startPosition.x)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(positionY, {
          toValue: startPosition.y - 60,
          duration: duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(positionX, {
          toValue: startPosition.x + (Math.random() * 30 - 15),
          duration: duration,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.2,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.3,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(duration * 0.7),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.3,
            useNativeDriver: true,
          })
        ])
      ])
    ]).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        transform: [
          { translateX: positionX },
          { translateY: positionY },
          { scale: scale }
        ],
        opacity: opacity,
      }}
    >
      <Ionicons name="star" size={size} color={color} />
    </Animated.View>
  );
};

export function PointsCard({ points, currentRank, pointsToNext, onRefresh, isLoading }: PointsCardProps) {
  const [showRanksModal, setShowRanksModal] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const [stars, setStars] = useState<Array<{ id: number; delay: number; duration: number; position: { x: number; y: number }; size: number }>>([]);
  const starsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextStarId = useRef(0);
  const modalSlideAnim = useRef(new Animated.Value(100)).current;
  const modalFadeAnim = useRef(new Animated.Value(0)).current;
  const rankItemAnims = useRef(ranks.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Initial animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();

    // Start pulsing animation for the rank icon
    startPulseAnimation();
    
    // Start generating stars
    startGeneratingStars();
    
    return () => {
      if (starsTimerRef.current) {
        clearInterval(starsTimerRef.current);
      }
    };
  }, []);

  const startGeneratingStars = () => {
    // Generate a new star every 800-1500ms
    starsTimerRef.current = setInterval(() => {
      const angle = Math.random() * Math.PI * 2; // Random angle around the circle
      const distance = 20 + Math.random() * 10; // Distance from center
      
      // Calculate position based on angle and distance
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;
      
      const newStar = {
        id: nextStarId.current++,
        delay: Math.random() * 200,
        duration: 1500 + Math.random() * 1000,
        position: { x, y },
        size: 6 + Math.random() * 6
      };
      
      setStars(prevStars => {
        // Keep only the last 8 stars to avoid too many animations
        const updatedStars = [...prevStars, newStar];
        if (updatedStars.length > 8) {
          return updatedStars.slice(updatedStars.length - 8);
        }
        return updatedStars;
      });
    }, 800 + Math.random() * 700);
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        })
      ])
    ).start();
  };

  const startRotation = () => {
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  };

  const handleRefresh = () => {
    startRotation();
    
    // Add a burst of stars on refresh
    const burstStars: Array<{ id: number; delay: number; duration: number; position: { x: number; y: number }; size: number }> = [];
    for (let i = 0; i < 5; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = 15 + Math.random() * 15;
      
      burstStars.push({
        id: nextStarId.current++,
        delay: i * 50,
        duration: 1200 + Math.random() * 800,
        position: { 
          x: Math.cos(angle) * distance, 
          y: Math.sin(angle) * distance 
        },
        size: 8 + Math.random() * 8
      });
    }
    
    setStars(prevStars => [...prevStars, ...burstStars].slice(-13));
    
    onRefresh();
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const rankDescriptions: { [key: string]: string } = {
    Rookie: "Nowy w naszej społeczności.\nCieszymy się, że dołączyłeś do Nas!",
    Trendsetter: "Twoja obecność kształtuje nasz styl.\nDobrze, że jesteś.",
    Icon: "Klub bez Ciebie to nie to samo.\nDziękujemy za Twoją lojalność!",
    Legend: "Jesteś twarzą naszego klubu.\nNie wiemy czy ochrona może Cię nawet wyrzucić.",
    GOAT: "Jesteś najlepszy w historii.\nUmawiasz się na kawę z właścicielami."
  };

  // Add this new function to animate the modal
  const animateModal = (visible: boolean) => {
    if (visible) {
      // Reset rank item animations
      rankItemAnims.forEach(anim => anim.setValue(0));
      
      // Animate modal in
      Animated.parallel([
        Animated.timing(modalSlideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modalFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ]).start();
      
      // Animate rank items in sequence
      Animated.stagger(
        50,
        rankItemAnims.map(anim => 
          Animated.timing(anim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          })
        )
      ).start();
    } else {
      // Animate modal out
      Animated.parallel([
        Animated.timing(modalSlideAnim, {
          toValue: 100,
          duration: 250,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(modalFadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowRanksModal(false);
      });
    }
  };

  // Update the handleOpenModal function
  const handleOpenModal = () => {
    setShowRanksModal(true);
    setTimeout(() => animateModal(true), 50);
  };

  // Update the handleCloseModal function
  const handleCloseModal = () => {
    animateModal(false);
  };

  return (
    <Animated.View 
      style={[
        styles.pointsCard, 
        isLoading && styles.pointsCardLoading,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
      ]}
    >
      <LinearGradient
        colors={['rgba(26, 26, 26, 0.8)', 'rgba(26, 26, 26, 0.95)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      />
      <View style={styles.pointsHeader}>
        <View>
          <Text style={styles.pointsLabel}>Suma zdobytych punktów</Text>
          <Animated.Text 
            style={[
              styles.pointsValue,
              { transform: [{ scale: isLoading ? 0.95 : 1 }] }
            ]}
          >
            {points || 0}
          </Animated.Text>
        </View>
        <Pressable 
          style={styles.rankIconContainer}
          onPress={handleRefresh}
          disabled={isLoading}
        >
          <View style={styles.starsContainer}>
            {stars.map(star => (
              <AnimatedStar 
                key={star.id}
                delay={star.delay}
                duration={star.duration}
                startPosition={star.position}
                size={star.size}
                color={currentRank?.color || "#ff3b7f"}
              />
            ))}
          </View>
          <Animated.View 
            style={[
              styles.rankIconBg,
              { 
                transform: [
                  { scale: pulseAnim },
                  { rotate: isLoading ? spin : '0deg' }
                ],
                backgroundColor: `${currentRank?.color || "#ff3b7f"}20`
              }
            ]}
          >
            <Ionicons 
              name={currentRank?.icon || "star"} 
              size={32} 
              color={currentRank?.color || "#ff3b7f"} 
            />
          </Animated.View>
        </Pressable>
      </View>
      <Pressable 
        style={styles.tierInfo}
        onPress={handleOpenModal}
      >
        <Ionicons 
          name={currentRank?.icon || "star"} 
          size={20} 
          color={currentRank?.color || "#ff3b7f"} 
        />
        <Text style={[styles.tierText, { color: currentRank?.color || "#ff3b7f" }]}>
          {currentRank?.name || 'Nowicjusz'}
        </Text>
        <Ionicons name="information-circle-outline" size={20} color="#fff" style={styles.infoIcon} />
      </Pressable>
      {pointsToNext > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.nextRankText}>
            {pointsToNext} punktów do następnej rangi
          </Text>
          <View style={styles.progressBarContainer}>
            <View 
              style={[
                styles.progressBar, 
                { 
                  width: `${Math.min(100, (points / (points + pointsToNext)) * 100)}%`,
                  backgroundColor: currentRank?.color || "#ff3b7f" 
                }
              ]} 
            />
          </View>
        </View>
      )}

      <Modal
        animationType="none"
        transparent={true}
        visible={showRanksModal}
        onRequestClose={handleCloseModal}
      >
        <Animated.View 
          style={[
            styles.modalOverlay,
            { opacity: modalFadeAnim }
          ]}
        >
          <Pressable 
            style={styles.modalBackdrop}
            onPress={handleCloseModal}
          />
          <Animated.View 
            style={[
              styles.modalContent,
              { transform: [{ translateY: modalSlideAnim }] }
            ]}
          >
            <LinearGradient
              colors={['rgba(30, 30, 30, 0.95)', 'rgba(20, 20, 20, 0.98)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalGradient}
            />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dostępne Rangi</Text>
              <Pressable
                onPress={handleCloseModal}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </Pressable>
            </View>
            
            <View style={styles.modalDivider} />
            
            <ScrollView style={styles.ranksList} showsVerticalScrollIndicator={false}>
              {ranks.map((rank, index) => (
                <Animated.View 
                  key={rank.name}
                  style={[
                    styles.rankItem,
                    currentRank?.name === rank.name && styles.currentRankItem,
                    {
                      opacity: rankItemAnims[index],
                      transform: [
                        { 
                          translateY: rankItemAnims[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0]
                          })
                        }
                      ]
                    }
                  ]}
                >
                  <LinearGradient
                    colors={currentRank?.name === rank.name ? 
                      [`${rank.color}10`, `${rank.color}20`] : 
                      ['rgba(40, 40, 40, 0.3)', 'rgba(30, 30, 30, 0.3)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.rankItemGradient}
                  />
                  <View style={styles.rankInfo}>
                    <View style={[styles.rankIconBadge, { backgroundColor: `${rank.color}20` }]}>
                      <Ionicons name={rank.icon} size={24} color={rank.color} />
                    </View>
                    <View style={styles.rankDetails}>
                      <Text style={[styles.rankName, { color: rank.color }]}>
                        {rank.name}
                      </Text>
                      <Text style={styles.rankPoints}>
                        Wymagane {rank.minPoints.toLocaleString()} punktów
                      </Text>
                      <Text style={styles.rankInfoText}>
                        {rankDescriptions[rank.name]}
                      </Text>
                    </View>
                  </View>
                  {currentRank?.name === rank.name && (
                    <View style={styles.currentBadgeContainer}>
                      <Text style={[styles.currentBadge, { backgroundColor: `${rank.color}20`, color: rank.color }]}>
                        Aktualna
                      </Text>
                    </View>
                  )}
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pointsCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(51, 51, 51, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  cardGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  pointsCardLoading: {
    opacity: 0.7,
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
  rankIconContainer: {
    padding: 4,
    position: 'relative',
  },
  starsContainer: {
    position: 'absolute',
    width: 100,
    height: 100,
    top: -20,
    left: -20,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
    zIndex: 5,
  },
  rankIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 127, 0.1)',
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
  progressContainer: {
    marginTop: 15,
  },
  nextRankText: {
    color: '#fff',
    opacity: 0.8,
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'left',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ff3b7f',
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
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 20,
  },
  modalGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  modalDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 15,
  },
  ranksList: {
    paddingRight: 5,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  rankItemGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  currentRankItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginVertical: 5,
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankDetails: {
    marginLeft: 12,
    flex: 1,
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
  currentBadgeContainer: {
    marginLeft: 10,
  },
  currentBadge: {
    backgroundColor: 'rgba(255, 59, 127, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    color: '#ff3b7f',
    fontSize: 12,
    fontWeight: '600',
  },
}); 