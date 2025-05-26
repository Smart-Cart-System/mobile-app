import { StyleSheet, ScrollView, TouchableOpacity, Image, View } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function HistoryScreen() {
  const tintColor = useThemeColor({}, 'tint');
  const [purchaseHistory, setPurchaseHistory] = useState([
    { 
      id: 1, 
      date: 'March 25, 2025', 
      store: 'Grocery Mart', 
      amount: '$45.75',
      paymentMethod: 'Credit Card',
      items: [
        { id: 1, name: 'Organic Apples', quantity: 6, price: '$8.99' },
        { id: 2, name: 'Almond Milk', quantity: 1, price: '$4.50' },
        { id: 3, name: 'Whole Wheat Bread', quantity: 2, price: '$6.50' },
        { id: 4, name: 'Eggs (dozen)', quantity: 1, price: '$5.99' }
      ]
    },
    { 
      id: 2, 
      date: 'March 20, 2025', 
      store: 'SuperMart',
      amount: '$32.40',
      paymentMethod: 'Mobile Wallet',
      items: [
        { id: 1, name: 'Chicken Breast', quantity: 1, price: '$12.99' },
        { id: 2, name: 'Greek Yogurt', quantity: 4, price: '$6.00' },
        { id: 3, name: 'Spinach', quantity: 1, price: '$3.49' }
      ]
    },
    { 
      id: 3, 
      date: 'March 15, 2025', 
      store: 'Fresh Market', 
      amount: '$22.30',
      paymentMethod: 'Credit Card',
      items: [
        { id: 1, name: 'Orange Juice', quantity: 1, price: '$4.99' },
        { id: 2, name: 'Avocados', quantity: 3, price: '$5.97' },
        { id: 3, name: 'Pasta', quantity: 2, price: '$3.98' }
      ]
    },
  ]);

  const [expandedReceipt, setExpandedReceipt] = useState<number | null>(null);

  const toggleReceipt = (id: number) => {
    if (expandedReceipt === id) {
      setExpandedReceipt(null);
    } else {
      setExpandedReceipt(id);
    }
  };

  return (    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Purchase History</ThemedText>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {purchaseHistory.map(purchase => (
          <ThemedView 
            key={purchase.id} 
            variant="card" 
            radius="large" 
            useShadow 
            intensity="low"
            style={styles.purchaseCard}
          >
            <View style={styles.purchaseHeader}>
              <View>
                <ThemedText style={styles.purchaseDate}>{purchase.date}</ThemedText>
                <ThemedText style={styles.purchaseStore}>{purchase.store}</ThemedText>
              </View>
              <View style={styles.amountContainer}>
                <ThemedText style={styles.purchaseAmount}>{purchase.amount}</ThemedText>
                <View style={styles.paymentMethod}>
                  <Ionicons 
                    name={purchase.paymentMethod === 'Credit Card' ? 'card-outline' : 'phone-portrait-outline'} 
                    size={14} 
                    color={tintColor}
                  />
                  <ThemedText style={styles.paymentMethodText}>{purchase.paymentMethod}</ThemedText>
                </View>
              </View>
            </View>
            
            <View style={styles.receiptActions}>
              <TouchableOpacity style={styles.buttonContainer}>
                <Ionicons name="download-outline" size={20} color={tintColor} />
                <ThemedText style={[styles.actionText, { color: tintColor }]}>Download</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonContainer} onPress={() => toggleReceipt(purchase.id)}>
                <Ionicons 
                  name={expandedReceipt === purchase.id ? "chevron-up-outline" : "chevron-down-outline"} 
                  size={20} 
                  color={tintColor} 
                />
                <ThemedText style={[styles.actionText, { color: tintColor }]}>
                  {expandedReceipt === purchase.id ? "Hide Details" : "View Details"}
                </ThemedText>
              </TouchableOpacity>
            </View>
            
            {expandedReceipt === purchase.id && (
              <View style={styles.receiptDetails}>
                <ThemedText style={styles.receiptTitle}>Receipt Details</ThemedText>
                {purchase.items.map(item => (
                  <View key={item.id} style={styles.receiptItem}>
                    <View style={styles.itemInfo}>
                      <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                      <ThemedText style={styles.itemQuantity}>x{item.quantity}</ThemedText>
                    </View>
                    <ThemedText style={styles.itemPrice}>{item.price}</ThemedText>
                  </View>
                ))}
                <View style={styles.receiptTotal}>
                  <ThemedText style={styles.totalLabel}>Total</ThemedText>
                  <ThemedText style={styles.totalAmount}>{purchase.amount}</ThemedText>
                </View>
              </View>
            )}
          </ThemedView>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  title: {
    marginBottom: 24,
    fontSize: 30,
    fontWeight: '700',
  },
  purchaseCard: {
    padding: 18,
    marginBottom: 18,
    borderRadius: 20, // Ensure consistent radius even if ThemedView fails
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  purchaseDate: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 4,
  },
  purchaseStore: {
    fontSize: 15,
    opacity: 0.7,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  purchaseAmount: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
  receiptActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
    paddingTop: 12,
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 20,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  receiptDetails: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    marginTop: 14,
    backgroundColor: 'rgba(240, 240, 240, 0.3)',
    borderRadius: 16,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 14,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 15,
    opacity: 0.7,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '500',
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.15)',
    paddingTop: 14,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: '700',
  },
});