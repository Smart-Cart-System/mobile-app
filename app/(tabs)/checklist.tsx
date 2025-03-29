import {
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Animated, // Keep if used elsewhere, otherwise removable
  Dimensions,
  View,
  Alert, // Added for confirmation/error messages
} from 'react-native';
import { useState, useRef, useEffect } from 'react'; // Added useEffect
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
// import { BlurView } from 'expo-blur'; // Uncomment if you use BlurView

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Added useLocalSearchParams
import { useThemeColor } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');

// --- Type Definitions ---
type ChecklistItem = {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: Date;
};

type Checklist = {
  id: string;
  title: string;
  items: ChecklistItem[];
  createdAt: Date;
  isShared: boolean;
};

// --- Component ---
export default function ChecklistScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background'); // Keep if explicitly needed, ThemedView handles it
  const textColor = useThemeColor({}, 'text'); // Keep if explicitly needed, ThemedText handles it
  const router = useRouter();
  const params = useLocalSearchParams<{ newItemsFromOCR?: string }>(); // Get local search params

  // --- State ---
  const [newListTitle, setNewListTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<{ [key: string]: string }>({});
  const [checklists, setChecklists] = useState<Checklist[]>([
    // Initial Example Data (can be removed or kept for testing)
    {
      id: '1',
      title: 'Grocery Shopping',
      items: [
        { id: '1-1', text: 'Milk', isCompleted: true, createdAt: new Date() },
        { id: '1-2', text: 'Eggs', isCompleted: false, createdAt: new Date() },
        { id: '1-3', text: 'Bread', isCompleted: false, createdAt: new Date() },
        { id: '1-4', text: 'Fruits', isCompleted: true, createdAt: new Date() },
      ],
      createdAt: new Date(),
      isShared: false,
    },
    {
      id: '2',
      title: 'Weekend Tasks',
      items: [
        { id: '2-1', text: 'Clean kitchen', isCompleted: false, createdAt: new Date() },
        { id: '2-2', text: 'Laundry', isCompleted: true, createdAt: new Date() },
        { id: '2-3', text: 'Call mom', isCompleted: false, createdAt: new Date() },
      ],
      createdAt: new Date(),
      isShared: true,
    },
  ]);

  const scrollViewRef = useRef<ScrollView>(null);

  // --- Effect to Handle Incoming OCR Items ---
  useEffect(() => {
    if (params.newItemsFromOCR) {
      console.log("Received OCR Params:", params.newItemsFromOCR); // Debug log
      try {
        const itemsArray: string[] = JSON.parse(params.newItemsFromOCR);

        if (Array.isArray(itemsArray) && itemsArray.length > 0) {
          // Create checklist items from the received strings
          const newChecklistItems: ChecklistItem[] = itemsArray.map((text, index) => ({
            id: `${Date.now()}-${index}`, // Simple unique ID generation
            text: text.trim(), // Trim whitespace just in case
            isCompleted: false,
            createdAt: new Date(),
          }));

          // Create the new checklist
          const newChecklist: Checklist = {
            id: `ocr-${Date.now()}`, // Unique ID for the list
            title: 'Scanned Checklist', // Default title
            items: newChecklistItems,
            createdAt: new Date(),
            isShared: false,
          };

          // Add the new checklist to the state (at the beginning)
          setChecklists(prevChecklists => [newChecklist, ...prevChecklists]);

          // Scroll to top to show the new list
          setTimeout(() => {
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          }, 100);

          // IMPORTANT: Clear the param so this doesn't run again on re-renders
          router.setParams({ newItemsFromOCR: undefined });
          console.log("Cleared OCR Params"); // Debug log

          // Optional: Show a confirmation alert
          Alert.alert("Success", `Created 'Scanned Checklist' with ${itemsArray.length} items.`);

        } else {
           console.warn("Received empty or invalid items from OCR parameter.");
           router.setParams({ newItemsFromOCR: undefined }); // Clear invalid param
        }

      } catch (error) {
        console.error("Error parsing OCR items parameter:", error);
        Alert.alert("Error", "Could not process items from the scanner.");
        // Clear the param even if there's an error
        router.setParams({ newItemsFromOCR: undefined });
      }
    }
  }, [params.newItemsFromOCR, router]); // Depend on the param and router

  // --- Functions ---
  const toggleItemCompletion = (checklistId: string, itemId: string) => {
    setChecklists(prevChecklists =>
      prevChecklists.map(checklist => {
        if (checklist.id === checklistId) {
          return {
            ...checklist,
            items: checklist.items.map(item => {
              if (item.id === itemId) {
                return { ...item, isCompleted: !item.isCompleted };
              }
              return item;
            }),
          };
        }
        return checklist;
      })
    );
  };

  const addNewChecklist = () => {
    if (newListTitle.trim() === '') return;

    const newChecklist: Checklist = {
      id: Date.now().toString(),
      title: newListTitle.trim(),
      items: [],
      createdAt: new Date(),
      isShared: false,
    };

    setChecklists(prevChecklists => [newChecklist, ...prevChecklists]);
    setNewListTitle('');

    // Scroll to top to show the new checklist
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }, 100);
  };

  const addNewItem = (checklistId: string) => {
    const itemText = newItemTexts[checklistId];
    if (!itemText || itemText.trim() === '') return;

    setChecklists(prevChecklists =>
      prevChecklists.map(checklist => {
        if (checklist.id === checklistId) {
          const newItem: ChecklistItem = {
            id: `${checklistId}-${Date.now()}`,
            text: itemText.trim(),
            isCompleted: false,
            createdAt: new Date()
          };

          // Add new item to the end of the list
          return {
            ...checklist,
            items: [...checklist.items, newItem]
          };
        }
        return checklist;
      })
    );

    // Clear the input for that specific checklist
    setNewItemTexts(prev => ({
      ...prev,
      [checklistId]: ''
    }));
  };

  const shareChecklist = async (checklistId: string) => {
    const checklist = checklists.find(c => c.id === checklistId);
    if (!checklist) return;

    // Toggle shared state locally first (optimistic update)
    setChecklists(prevChecklists =>
      prevChecklists.map(c => {
        if (c.id === checklistId) {
          return {
            ...c,
            isShared: !c.isShared, // Toggle the state
          };
        }
        return c;
      })
    );

    // Prepare message for sharing
    const message = `Checklist: ${checklist.title}\n\n` +
      checklist.items.map(item => `- ${item.isCompleted ? '[x]' : '[ ]'} ${item.text}`).join('\n'); // Using text-based markers

    // Attempt to use Expo Sharing
    if (await Sharing.isAvailableAsync()) {
      try {
        await Sharing.shareAsync(`data:text/plain;,${encodeURIComponent(message)}`, {
          dialogTitle: `Share "${checklist.title}" checklist`,
          mimeType: 'text/plain',
          UTI: 'public.plain-text', // For iOS compatibility
        });
        // Optionally confirm sharing success or handle completion
        // Note: Sharing doesn't guarantee the user actually sent it.
      } catch (error) {
        console.error('Error sharing checklist:', error);
        Alert.alert('Sharing Failed', 'Could not share the checklist.');
        // Optional: Revert the isShared state if sharing fails critically
        setChecklists(prevChecklists =>
          prevChecklists.map(c => {
            if (c.id === checklistId) {
              return { ...c, isShared: !c.isShared }; // Revert toggle on error
            }
            return c;
          })
        );
      }
    } else {
      Alert.alert('Sharing Not Available', 'Sharing is not available on this device.');
       // Revert the isShared state if sharing is not possible
       setChecklists(prevChecklists =>
          prevChecklists.map(c => {
            if (c.id === checklistId) {
              return { ...c, isShared: !c.isShared }; // Revert toggle
            }
            return c;
          })
        );
    }
  };

  const handleScanOCR = () => {
     // Make sure this path matches your file structure for the scanner screen
     // e.g., '/ocr-scanner' if it's at the root of 'app'
    router.push('/ocr-scanner');
  };

  const getCompletionPercentage = (items: ChecklistItem[]) => {
    if (!items || items.length === 0) return 0;
    const completedItems = items.filter(item => item.isCompleted);
    return (completedItems.length / items.length) * 100;
  };

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
            style={[styles.textInput, { color: '#fff' }]} // Explicit white color for text input
            placeholder="New checklist title..."
            placeholderTextColor="rgba(255, 255, 255, 0.7)"
            value={newListTitle}
            onChangeText={setNewListTitle}
            onSubmitEditing={addNewChecklist} // Allows creating list by pressing return/done
            returnKeyType="done"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addNewChecklist}
            disabled={newListTitle.trim() === ''} // Disable button if title is empty
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={28} color={newListTitle.trim() === '' ? 'rgba(255,255,255,0.4)' : '#FFF'} />
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
          // Green gradient for scan button
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
        ref={scrollViewRef}
        style={styles.checklistsContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled" // Dismiss keyboard when tapping outside inputs
      >
        {checklists.map(checklist => {
          const completionPercentage = getCompletionPercentage(checklist.items);
          const currentNewItemText = newItemTexts[checklist.id] || ''; // Get text for this specific list

          return (
            <ThemedView key={checklist.id} style={styles.checklistCard}>
              {/* Checklist Header */}
              <ThemedView style={[styles.checklistHeader, { backgroundColor: 'transparent' }]}>
                <ThemedText style={styles.checklistTitle} numberOfLines={1} ellipsizeMode="tail">{checklist.title}</ThemedText>
                <TouchableOpacity
                  style={[styles.shareButton, checklist.isShared && styles.activeShareButton]}
                  onPress={() => shareChecklist(checklist.id)}
                >
                  <Ionicons
                    name={checklist.isShared ? "checkmark-done-circle" : "share-outline"} // Changed icon for shared
                    size={20}
                    color={checklist.isShared ? "#fff" : tintColor}
                  />
                  <ThemedText style={[styles.shareButtonText, checklist.isShared && { color: '#fff' }]}>
                    {checklist.isShared ? "Shared" : "Share"}
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
                        { width: `${completionPercentage}%`, backgroundColor: tintColor } // Use tint color for progress
                      ]}
                    />
                  </ThemedView>
                  <ThemedText style={styles.progressText}>
                    {`${Math.round(completionPercentage)}% complete`}
                  </ThemedText>
                </ThemedView>
              )}

              {/* Item List */}
              {checklist.items.length > 0 && (
                <ThemedView style={[styles.itemsContainer, { backgroundColor: 'transparent' }]}>
                  {checklist.items.map((item, index) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.checklistItem,
                        index === checklist.items.length - 1 && { borderBottomWidth: 0 } // No border on last item
                      ]}
                      onPress={() => toggleItemCompletion(checklist.id, item.id)}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.checkboxContainer,
                        { borderColor: item.isCompleted ? tintColor : 'rgba(150, 150, 150, 0.7)'}, // Use tint color for completed border
                        item.isCompleted && styles.checkboxCompleted, // Apply completed background
                        item.isCompleted && { backgroundColor: tintColor } // Use tint color for background
                      ]}>
                        {item.isCompleted && (
                          <Ionicons name="checkmark" size={16} color="#fff" /> // White checkmark
                        )}
                      </View>
                      <ThemedText
                        style={[
                          styles.checklistItemText,
                          item.isCompleted && styles.completedItemText
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
                  style={[styles.newItemInput, { color: textColor }]} // Use theme text color
                  placeholder="Add new item..."
                  placeholderTextColor="rgba(150, 150, 150, 0.8)"
                  value={currentNewItemText}
                  onChangeText={(text) => setNewItemTexts(prev => ({ ...prev, [checklist.id]: text }))}
                  onSubmitEditing={() => addNewItem(checklist.id)} // Add item on return/done
                  returnKeyType="done"
                  blurOnSubmit={false} // Keep keyboard open sometimes useful, but can be true
                />
                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={() => addNewItem(checklist.id)}
                  disabled={currentNewItemText.trim() === ''} // Disable if input is empty
                >
                  <Ionicons
                    name="add-circle"
                    size={28} // Slightly larger icon
                    color={currentNewItemText.trim() ? tintColor : 'rgba(150, 150, 150, 0.5)'}
                  />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

// --- Styles --- (Mostly unchanged, minor adjustments noted)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // Background color is handled by ThemedView
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60, // Adjust as needed for status bar/notch
    paddingBottom: 16,
    backgroundColor: 'transparent', // Let ThemedView handle background
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold', // Changed from 700
    letterSpacing: 0.5,
    // Color is handled by ThemedText
  },
  addNewSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  addNewContainer: {
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    // Shadows for depth
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textInput: {
    flex: 1,
    paddingVertical: 14, // Adjusted padding
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    // Color set inline based on context
  },
  addButton: {
    width: 60, // Slightly wider
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Subtle background
  },
  scanButton: {
    marginHorizontal: 20,
    marginBottom: 20, // Adjusted margin
    borderRadius: 15,
    overflow: 'hidden',
    // Shadows for depth
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14, // Adjusted padding
  },
  scanIcon: {
    marginRight: 10,
  },
  scanButtonText: {
    color: '#FFF', // Explicit white color
    fontSize: 16,
    fontWeight: '600',
  },
  checklistsContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4, // Small padding at the top of scroll
    paddingBottom: 40, // More padding at the bottom
  },
  checklistCard: {
    borderRadius: 18,
    marginBottom: 20,
    padding: 18, // Adjusted padding
    // backgroundColor handled by ThemedView, but provide a fallback/base
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Very subtle background in case theme fails
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)', // Subtle border
    overflow: 'hidden', // Clip content within border radius
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14, // Adjusted margin
    backgroundColor: 'transparent', // Ensure no extra background
  },
  checklistTitle: {
    fontSize: 20, // Slightly smaller title
    fontWeight: 'bold', // Bolder title
    flex: 1, // Allow title to take available space
    marginRight: 12,
    // Color from ThemedText
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.15)', // Default share button bg
  },
  activeShareButton: {
    backgroundColor: '#007BFF', // Active share button bg (example blue)
    // Could also use tintColor here if desired
  },
  shareButtonText: {
    fontSize: 13, // Slightly smaller text
    fontWeight: '600',
    marginLeft: 6, // Increased spacing
    // Color set inline based on state
  },
  progressContainer: {
    marginBottom: 16,
    backgroundColor: 'transparent',
  },
  progressBar: {
    height: 6, // Slimmer progress bar
    backgroundColor: 'rgba(200, 200, 200, 0.2)', // Background of the bar track
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6, // Adjusted margin
  },
  progressFill: {
    height: '100%',
    // backgroundColor set inline (using tintColor)
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12, // Smaller progress text
    fontWeight: '500',
    opacity: 0.7,
    textAlign: 'right', // Align progress text to the right
    // Color from ThemedText
  },
  itemsContainer: {
    // Container for the list items
    backgroundColor: 'transparent',
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Adjusted padding
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.1)', // Lighter separator
  },
  emptyListText: {
      paddingVertical: 20,
      textAlign: 'center',
      fontSize: 15,
      opacity: 0.6,
      fontStyle: 'italic',
  },
  checkboxContainer: {
    width: 22, // Slightly smaller checkbox
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    // borderColor set inline based on state and theme
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14, // Increased spacing
  },
  checkboxCompleted: {
    // backgroundColor set inline using tintColor
    // borderColor set inline using tintColor
  },
  checklistItemText: {
    fontSize: 16,
    fontWeight: '400', // Regular weight for items
    flex: 1,
    // Color from ThemedText
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    opacity: 0.5, // More faded when completed
  },
  newItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12, // Adjusted margin
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 200, 200, 0.1)', // Lighter separator
    backgroundColor: 'transparent',
  },
  newItemInput: {
    flex: 1,
    paddingVertical: 10, // Adjusted padding
    paddingHorizontal: 4, // Less horizontal padding needed here
    fontSize: 16,
    // Color from ThemedText via inline style
  },
  addItemButton: {
    paddingLeft: 10, // Space before button
    paddingRight: 4, // Align icon nicely
    paddingVertical: 5, // Make tap area slightly larger vertically
  },
});