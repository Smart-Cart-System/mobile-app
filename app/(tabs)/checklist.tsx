import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Animated, Dimensions, View } from 'react-native';
import { useState, useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';
import { useThemeColor } from '@/hooks/useThemeColor';

const { width } = Dimensions.get('window');

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

export default function ChecklistScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const router = useRouter();
  const [newListTitle, setNewListTitle] = useState('');
  const [newItemTexts, setNewItemTexts] = useState<{[key: string]: string}>({});
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [checklists, setChecklists] = useState<Checklist[]>([
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
      title: newListTitle,
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
          const newItem = {
            id: `${checklistId}-${Date.now()}`,
            text: itemText.trim(),
            isCompleted: false,
            createdAt: new Date()
          };
          
          return {
            ...checklist,
            items: [...checklist.items, newItem]
          };
        }
        return checklist;
      })
    );
    
    // Clear the input
    setNewItemTexts(prev => ({
      ...prev,
      [checklistId]: ''
    }));
  };

  const shareChecklist = async (checklistId: string) => {
    // In a real app, this would generate a sharing link
    // and update the backend. For demo, we'll just toggle the isShared state
    setChecklists(prevChecklists =>
      prevChecklists.map(checklist => {
        if (checklist.id === checklistId) {
          return {
            ...checklist,
            isShared: !checklist.isShared,
          };
        }
        return checklist;
      })
    );
    
    // Mock sharing functionality
    if (await Sharing.isAvailableAsync()) {
      const checklist = checklists.find(c => c.id === checklistId);
      if (checklist) {
        const message = `Checklist: ${checklist.title}\n\n` + 
          checklist.items.map(item => `- ${item.isCompleted ? '✅' : '⬜'} ${item.text}`).join('\n');
        
        try {
          await Sharing.shareAsync(`data:text/plain;,${encodeURIComponent(message)}`, {
            dialogTitle: `Share "${checklist.title}" checklist`,
            mimeType: 'text/plain',
            UTI: 'public.plain-text',
          });
        } catch (error) {
          console.error('Error sharing checklist:', error);
        }
      }
    }
  };

  const handleScanOCR = () => {
    router.push("./ocr-scanner");
  };

  const getCompletionPercentage = (items: ChecklistItem[]) => {
    if (items.length === 0) return 0;
    const completedItems = items.filter(item => item.isCompleted);
    return (completedItems.length / items.length) * 100;
  };

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
          />
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={addNewChecklist}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={28} color="#FFF" />
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
        ref={scrollViewRef}
        style={styles.checklistsContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {checklists.map(checklist => {
          const completionPercentage = getCompletionPercentage(checklist.items);
          
          return (
            <ThemedView key={checklist.id} style={styles.checklistCard}>
              {/* Checklist Header */}
              <ThemedView style={styles.checklistHeader}>
                <ThemedText style={styles.checklistTitle}>{checklist.title}</ThemedText>
                <TouchableOpacity 
                  style={[styles.shareButton, checklist.isShared && styles.activeShareButton]} 
                  onPress={() => shareChecklist(checklist.id)}
                >
                  <Ionicons 
                    name={checklist.isShared ? "share" : "share-outline"} 
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
                <ThemedView style={styles.progressContainer}>
                  <ThemedView style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${completionPercentage}%` }
                      ]} 
                    />
                  </ThemedView>
                  <ThemedText style={styles.progressText}>
                    {`${Math.round(completionPercentage)}% complete`}
                  </ThemedText>
                </ThemedView>
              )}
              
              {/* Item List */}
              <ThemedView style={styles.itemsContainer}>
                {checklist.items.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id}
                    style={[
                      styles.checklistItem,
                      index === checklist.items.length - 1 && { borderBottomWidth: 0 }
                    ]}
                    onPress={() => toggleItemCompletion(checklist.id, item.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[
                      styles.checkboxContainer,
                      item.isCompleted && styles.checkboxCompleted
                    ]}>
                      {item.isCompleted && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <ThemedText 
                      style={[
                        styles.checklistItemText,
                        item.isCompleted && styles.completedItemText
                      ]}
                    >
                      {item.text}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
              
              {/* Add New Item */}
              <ThemedView style={styles.newItemContainer}>
                <TextInput
                  style={styles.newItemInput}
                  placeholder="Add new item..."
                  placeholderTextColor="rgba(150, 150, 150, 0.8)"
                  value={newItemTexts[checklist.id] || ''}
                  onChangeText={(text) => setNewItemTexts(prev => ({...prev, [checklist.id]: text}))}
                  onSubmitEditing={() => addNewItem(checklist.id)}
                />
                <TouchableOpacity 
                  style={styles.addItemButton}
                  onPress={() => addNewItem(checklist.id)}
                  disabled={!newItemTexts[checklist.id]}
                >
                  <Ionicons 
                    name="add-circle" 
                    size={24} 
                    color={newItemTexts[checklist.id] ? tintColor : 'rgba(150, 150, 150, 0.5)'} 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  addNewSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  addNewContainer: {
    flexDirection: 'row',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  addButton: {
    width: 55,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scanButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
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
    paddingBottom: 30,
  },
  checklistCard: {
    borderRadius: 18,
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  checklistHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checklistTitle: {
    fontSize: 22,
    fontWeight: '700',
    flex: 1,
    marginRight: 12,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
  },
  activeShareButton: {
    backgroundColor: '#007BFF',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.15)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    opacity: 0.7,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  checklistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.15)',
  },
  checkboxContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(150, 150, 150, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checklistItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  completedItemText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  newItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(200, 200, 200, 0.15)',
  },
  newItemInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  addItemButton: {
    paddingLeft: 8,
    paddingRight: 4,
  },
});