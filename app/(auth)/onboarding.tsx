import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useVideoPlayer, VideoView, VideoSource } from 'expo-video';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function OnboardingScreen() {
  const videoSource: VideoSource = {
    uri: 'https://rwxzctowvxylopuzpsti.supabase.co/storage/v1/object/sign/images/Nightzone.mp4?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvTmlnaHR6b25lLm1wNCIsImlhdCI6MTczOTk4MDkzOCwiZXhwIjoxODk3NjYwOTM4fQ.OvorkUsQtb1noHSDQ-OB-QGAluP5VjFtixcsvDrzGc4',
    metadata: {
      title: 'Onboarding Video',
    }
  };

  const player = useVideoPlayer(videoSource, player => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const handleGetStarted = () => {
    router.push('/sign-in');
  };

  return (
    <View style={styles.container}>
      <VideoView 
        style={styles.backgroundImage} 
        player={player}
        contentFit="cover"
        nativeControls={false}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.content}>
        <View style={styles.spacer} />
        <Text style={styles.title}></Text>
        
        <View style={styles.footer}>
          <Pressable
            style={styles.button}
            onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  spacer: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  footer: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#ff3b7f',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 