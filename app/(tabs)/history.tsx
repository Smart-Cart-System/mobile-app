import { StyleSheet, ScrollView, Image } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HistoryScreen() {
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

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Purchase History</ThemedText>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {purchaseHistory.map(purchase => (
          <ThemedView key={purchase.id} style={styles.purchaseCard}>
            <ThemedView style={styles.purchaseHeader}>
              <ThemedView>
                <ThemedText style={styles.purchaseDate}>{purchase.date}</ThemedText>
                <ThemedText style={styles.purchaseStore}>{purchase.store}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.amountContainer}>
                <ThemedText style={styles.purchaseAmount}>{purchase.amount}</ThemedText>
                <ThemedView style={styles.paymentMethod}>
                  <Ionicons 
                    name={purchase.paymentMethod === 'Credit Card' ? 'card-outline' : 'phone-portrait-outline'} 
                    size={14} 
                    color="#666"
                  />
                  <ThemedText style={styles.paymentMethodText}>{purchase.paymentMethod}</ThemedText>
                </ThemedView>
              </ThemedView>
            </ThemedView>
            
            <ThemedView style={styles.receiptActions}>
              <ThemedView style={styles.buttonContainer}>
                <Ionicons name="download-outline" size={20} color="#666" />
                <ThemedText style={styles.actionText}>Download</ThemedText>
              </ThemedView>
              <ThemedView style={styles.buttonContainer} onTouchEnd={() => toggleReceipt(purchase.id)}>
                <Ionicons 
                  name={expandedReceipt === purchase.id ? "chevron-up-outline" : "chevron-down-outline"} 
                  size={20} 
                  color="#666" 
                />
                <ThemedText style={styles.actionText}>
                  {expandedReceipt === purchase.id ? "Hide Details" : "View Details"}
                </ThemedText>
              </ThemedView>
            </ThemedView>
            
            {expandedReceipt === purchase.id && (
              <ThemedView style={styles.receiptDetails}>
                <ThemedText style={styles.receiptTitle}>Receipt Details</ThemedText>
                {purchase.items.map(item => (
                  <ThemedView key={item.id} style={styles.receiptItem}>
                    <ThemedView style={styles.itemInfo}>
                      <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                      <ThemedText style={styles.itemQuantity}>x{item.quantity}</ThemedText>
                    </ThemedView>
                    <ThemedText style={styles.itemPrice}>{item.price}</ThemedText>
                  </ThemedView>
                ))}
                <ThemedView style={styles.receiptTotal}>
                  <ThemedText style={styles.totalLabel}>Total</ThemedText>
                  <ThemedText style={styles.totalAmount}>{purchase.amount}</ThemedText>
                </ThemedView>
              </ThemedView>
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
    padding: 16,
    paddingTop: 60,
  },
  title: {
    marginBottom: 24,
  },
  purchaseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  purchaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  purchaseDate: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  purchaseStore: {
    fontSize: 14,
    opacity: 0.7,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  purchaseAmount: {
    fontSize: 18,
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
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
  },
  receiptDetails: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 16,
    marginTop: 12,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  receiptItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    marginRight: 8,
  },
  itemQuantity: {
    fontSize: 14,
    opacity: 0.7,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '500',
  },
  receiptTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});