import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../utils/theme';
import { AdMobService } from '../../../services/admob-service';

interface RewardedAdPromptModalProps {
  visible: boolean;
  routineTitle: string;
  onClose: () => void;
  onRewardReceived?: () => void;
}

export const RewardedAdPromptModal: React.FC<RewardedAdPromptModalProps> = ({
  visible,
  routineTitle,
  onClose,
  onRewardReceived,
}) => {
  const { colors, isDark } = useTheme();

  if (!visible) return null;

  const handleWatchAd = async () => {
    await AdMobService.showRewardedAd(
      () => {
        if (onRewardReceived) onRewardReceived();
      },
      () => {
        onClose();
      }
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialogCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.badgeEmoji}>🛡️</Text>
          <Text style={[styles.title, { color: colors.text }]}>Routine Completed!</Text>
          <Text style={[styles.routineName, { color: '#10B981' }]}>{routineTitle}</Text>

          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Your streak is saved! Would you like to watch an optional sponsor video to earn a bonus{' '}
            <Text style={{ color: '#F59E0B', fontWeight: '800' }}>Streak Shield</Text> to protect
            against future emergencies?
          </Text>

          {/* Action Buttons */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleWatchAd}
            style={[styles.btnWatch, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.btnWatchText}>▶ Watch Sponsor Video (+1 Shield)</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.7} onPress={onClose} style={styles.btnSkip}>
            <Text style={[styles.btnSkipText, { color: colors.textSecondary }]}>
              No thanks, continue
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  badgeEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  routineName: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 20,
  },
  btnWatch: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  btnWatchText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  btnSkip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  btnSkipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
