import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';
import { checklistService, Checklist, ChecklistItem } from '@/services';

// --- Component ---
export default function ChecklistScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const router = useRouter();
  const params = useLocalSearchParams<{ newItemsFromOCR?: string }>();

  // --- State ---
  const [newListTitle, setNewListTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<{ [key: string]: string }>({});
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // --- Load checklists on component mount ---
  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      setIsLoading(true);
      const fetchedChecklists = await checklistService.getAllChecklists();
      setChecklists(fetchedChecklists);
    } catch (error) {
      console.error('Error loading checklists:', error);
      Alert.alert('Error', 'Failed to load checklists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effect to Handle Incoming OCR Items ---
  useEffect(() => {
    if (params.newItemsFromOCR) {
      console.log("Received OCR Params:", params.newItemsFromOCR);
      try {
        const itemsArray: string[] = JSON.parse(params.newItemsFromOCR);

        if (Array.isArray(itemsArray) && itemsArray.length > 0) {
          createChecklistFromOCR(itemsArray);
        } else {
          console.warn("Received empty or invalid items from OCR parameter.");
          router.setParams({ newItemsFromOCR: undefined });
        }
      } catch (error) {
        console.error("Error parsing OCR items parameter:", error);
        Alert.alert("Error", "Could not process items from the scanner.");
        router.setParams({ newItemsFromOCR: undefined });
      }
    }
  }, [params.newItemsFromOCR, router]);

  const createChecklistFromOCR = async (itemsArray: string[]) => {
    try {
      setIsCreatingChecklist(true);

      const checklistData = {
        name: 'Scanned Checklist',
        items: itemsArray.map(text => ({
          text: text.trim(),
          checked: false
        }))
      };

      const newChecklist = await checklistService.createChecklist(checklistData);
      setChecklists(prevChecklists => [newChecklist, ...prevChecklists]);

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);

      router.setParams({ newItemsFromOCR: undefined });
      Alert.alert("Success", "Created 'Scanned Checklist' with " + itemsArray.length + " items.");
    } catch (error) {
      console.error('Error creating checklist from OCR:', error);
      Alert.alert('Error', 'Failed to create checklist from scanned items.');
    } finally {
      setIsCreatingChecklist(false);
    }
  };

  // --- Functions ---
  const toggleItemCompletion = async (checklistId: number, itemId: number) => {
    try {
      const checklist = checklists.find(c => c.id === checklistId);
      const item = checklist?.items.find(i => i.id === itemId);

      if (!item) return;

      const updatedItem = await checklistService.updateItem(checklistId, itemId, {
        checked: !item.checked
      });

      setChecklists(prevChecklists =>
        prevChecklists.map(checklist => {
          if (checklist.id === checklistId) {
            return {
              ...checklist,
              items: checklist.items.map(item =>
                item.id === itemId ? updatedItem : item
              ),
            };
          }
          return checklist;
        })
      );
    } catch (error) {
      console.error('Error toggling item completion:', error);
      Alert.alert('Error', 'Failed to update item. Please try again.');
    }
  };

  const addNewChecklist = async () => {
    if (newListTitle.trim() === '') return;

    try {
      setIsCreatingChecklist(true);
      const newChecklist = await checklistService.createChecklist({
        name: newListTitle.trim(),
        items: []
      });

      setChecklists(prevChecklists => [newChecklist, ...prevChecklists]);
      setNewListTitle('');

      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    } catch (error) {
      console.error('Error creating checklist:', error);
      Alert.alert('Error', 'Failed to create checklist. Please try again.');
    } finally {
      setIsCreatingChecklist(false);
    }
  };

  const addNewItem = async (checklistId: number) => {
    const itemText = newItemTexts[checklistId.toString()];
    if (!itemText || itemText.trim() === '') return;

    try {
      const newItem = await checklistService.addItem(checklistId, {
        text: itemText.trim(),
        checked: false
      });

      setChecklists(prevChecklists =>
        prevChecklists.map(checklist => {
          if (checklist.id === checklistId) {
            return {
              ...checklist,
              items: [...checklist.items, newItem]
            };
          }
          return checklist;
        })
      );

      setNewItemTexts(prev => ({
        ...prev,
        [checklistId.toString()]: ''
      }));
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item. Please try again.');
    }
  };

  const shareChecklist = async (checklistId: number) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    const message = `Checklist: ${checklist.name}\n\n` +
      checklist.items.map(item => `- ${item.checked ? '[x]' : '[ ]'} ${item.text}`).join('\n');

    if (await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(`data:text/plain;,${encodeURIComponent(message)}`, {
          dialogTitle: `Share "${checklist.name}" checklist`,
          mimeType: 'text/plain',
          UTI: 'public.plain-text',
        });
      } catch (error) {
        console.error('Error sharing checklist:', error);
        Alert.alert('Sharing Failed', 'Could not share the checklist.');
      }
    } else {
      Alert.alert('Sharing Not Available', 'Sharing is not available on this device.');
    }
  };

  const handleScanOCR = () => {
    // Make sure this path matches your file structure for the scanner screen
    // e.g., '/ocr-scanner' if it's at the root of 'app'
    router.push('/ocr-scanner');
  };
  const getCompletionPercentage = (items: ChecklistItem[]) => {
    if (!items || items.length === 0) return 0;
    const completedItems = items.filter(item => item.checked);
    return (completedItems.length / items.length) * 100;
  };

  // Show loading indicator while fetching checklists
  if (isLoading) {
    return (<ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>My Checklists</ThemedText>
      </ThemedView>
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={tintColor || '#007AFF'} />
        <ThemedText style={styles.loadingText}>Loading checklists...</ThemedText>
      </View>
    </ThemedView>
    );
  }

  // --- Render ---
  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>My Checklists</ThemedText>
      </ThemedView>

      {/* Create New Checklist Section */}
      <ThemedView style={styles.addNewSection}>
        <LinearGradient
          colors={['rgba(78, 84, 200, 0.8)', 'rgba(143, 148, 251, 0.8)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.addNewContainer}
        >
          <TextInput
            style={[styles.textInput, { color: '#fff' }]}
            placeholder="New checklist title..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={newListTitle}
            onChangeText={setNewListTitle}
            onSubmitEditing={addNewChecklist}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addButton}            onPress={addNewChecklist}
            disabled={newListTitle.trim() === '' || isCreatingChecklist}
            activeOpacity={0.7}
          >
            {isCreatingChecklist ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Ionicons
              name="add"
              size={28}
              color={newListTitle.trim() === '' ? 'rgba(255,255,255,0.4)' : '#FFF'}
            />
          )}
          </TouchableOpacity>
        </LinearGradient>
      </ThemedView>

      {/* OCR Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleScanOCR}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['rgba(52, 168, 83, 0.9)', 'rgba(21, 128, 61, 0.9)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.scanButtonGradient}
        >
          <Ionicons name="scan-outline" size={22} color="#FFF" style={styles.scanIcon} />
          <ThemedText style={styles.scanButtonText}>Create List from Image</ThemedText>
        </LinearGradient>
      </TouchableOpacity>

      {/* Checklists */}
      <ScrollView
        ref={scrollViewRef}        style={styles.checklistsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {checklists.map(checklist => {
        const completionPercentage = getCompletionPercentage(checklist.items);
        const currentNewItemText = newItemTexts[checklist.id.toString()] || '';

        return (
          <ThemedView key={checklist.id} style={styles.checklistCard}>
            {/* Checklist Header */}
            <ThemedView style={[styles.checklistHeader, { backgroundColor: 'transparent' }]}>
              <ThemedText style={styles.checklistTitle} numberOfLines={1} ellipsizeMode="tail">{checklist.name}</ThemedText>
              <TouchableOpacity
                style={styles.shareButton}
                onPress={() => shareChecklist(checklist.id)}
              >
                <Ionicons
                  name="share-outline"
                  size={20}
                  color={tintColor}
                />
                <ThemedText style={styles.shareButtonText}>
                  Share
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>

            {/* Progress Bar */}
            {checklist.items.length > 0 && (
              <ThemedView style={[styles.progressContainer, { backgroundColor: 'transparent' }]}>
                <ThemedView style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.round(completionPercentage)}%`, backgroundColor: tintColor }
                    ]}
                  />
                </ThemedView>
                <ThemedText style={styles.progressText}>
                  {Math.round(completionPercentage)}% complete
                </ThemedText>
              </ThemedView>
            )}

            {/* Item List */}
            {checklist.items.length > 0 && (
              <ThemedView style={[styles.itemsContainer, { backgroundColor: 'transparent' }]}>
                {checklist.items.map((item, index) => (                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.checklistItem,
                    index === checklist.items.length - 1 ? { borderBottomWidth: 0 } : null
                  ]}
                  onPress={() => toggleItemCompletion(checklist.id, item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkboxContainer,
                    { borderColor: item.checked ? tintColor : 'rgba(150, 150, 150, 0.7)' },
                    item.checked ? styles.checkboxCompleted : null,
                    item.checked ? { backgroundColor: tintColor } : null
                  ]}>
                      {item.checked && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <ThemedText style={[
                      styles.checklistItemText,
                      item.checked ? styles.completedItemText : null
                    ]}
                      numberOfLines={1}
                      ellipsizeMode='tail'
                    >
                      {item.text}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            )}
            {/* Message for empty list */}
            {checklist.items.length === 0 && (
              <ThemedText style={styles.emptyListText}>This list is empty. Add some items!</ThemedText>
            )}

            {/* Add New Item */}
            <ThemedView style={[styles.newItemContainer, { backgroundColor: 'transparent' }]}>
              <TextInput
                style={styles.newItemInput}
                placeholder="Add new item..."
                placeholderTextColor="rgba(150, 150, 150, 0.8)"
                value={currentNewItemText}
                onChangeText={(text) => setNewItemTexts(prev => ({ ...prev, [checklist.id.toString()]: text }))}
                onSubmitEditing={() => addNewItem(checklist.id)}
                returnKeyType="done"
                blurOnSubmit={false}
              />
              <TouchableOpacity
                style={styles.addItemButton}
                onPress={() => addNewItem(checklist.id)}
                disabled={currentNewItemText.trim() === ''}
              >
                <Ionicons
                  name="add-circle"
                  size={28}
                  color={currentNewItemText.trim() ? tintColor : 'rgba(150, 150, 150, 0.5)'}
                />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
        )
      })}
      </ScrollView>
    </ThemedView>
  )
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
  },
  addNewSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  addNewContainer: {
    flexDirection: 'row',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scanButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  scanIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  checklistsContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 40,
  },
  checklistCard: {
    borderRadius: 20,
    marginBottom: 20,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    overflow: 'hidden',
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: 'transparent',
  },
  checklistTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  shareButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.7,
    textAlign: 'right',
  },
  itemsContainer: {
    backgroundColor: 'transparent',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 4,
  },
  emptyListText: {
    paddingVertical: 20,
    textAlign: 'center',
    fontSize: 15,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  checkboxCompleted: {
    // backgroundColor and borderColor set inline using tintColor
  },
  checklistItemText: {
    fontSize: 16,
    fontWeight: '400',
    flex: 1,
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  newItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 200, 200, 0.1)',
    backgroundColor: 'transparent',
  },
  newItemInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  addItemButton: {
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 5,
  },
});