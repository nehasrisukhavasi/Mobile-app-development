import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@module03_expenses_v1';
const CATEGORIES = ['All', 'Food', 'Travel', 'Bills', 'Shopping'];
const INPUT_CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping'];

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Food');
  const [filterCategory, setFilterCategory] = useState('All');

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  const loadExpenses = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue != null) {
        const parsed = JSON.parse(jsonValue);
        if (Array.isArray(parsed)) {
          setExpenses(parsed);
        }
      }
    } catch (e) {
      Alert.alert('Storage Error', 'Failed to load saved expenses.');
    }
  };

  const saveExpenses = async (items) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      Alert.alert('Storage Error', 'Failed to save expenses locally.');
    }
  };

  const handleAddExpense = () => {
    const trimmedTitle = title.trim();
    const numericAmount = parseFloat(amount);

    if (!trimmedTitle) {
      Alert.alert('Validation', 'Please enter an expense title.');
      return;
    }
    if (isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert('Validation', 'Please enter a valid amount greater than 0.');
      return;
    }

    const newExpense = {
      id: Date.now().toString(),
      title: trimmedTitle,
      amount: Number(numericAmount.toFixed(2)),
      category: selectedCategory,
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses((prev) => [newExpense, ...prev]);
    setTitle('');
    setAmount('');
  };

  const handleDeleteExpense = (id) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredExpenses = useMemo(() => {
    if (filterCategory === 'All') return expenses;
    return expenses.filter((item) => item.category === filterCategory);
  }, [expenses, filterCategory]);

  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [filteredExpenses]);

  const renderExpenseItem = ({ item }) => (
    <View style={styles.expenseCard}>
      <View style={styles.expenseLeft}>
        <Text style={styles.expenseTitle}>{item.title}</Text>
        <Text style={styles.expenseMeta}>
          {item.category} • {item.date}
        </Text>
      </View>
      <View style={styles.expenseRight}>
        <Text style={styles.expenseAmount}>₹{Number(item.amount).toFixed(2)}</Text>
        <TouchableOpacity
          onPress={() => handleDeleteExpense(item.id)}
          style={styles.deleteBtn}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Expense Tracker</Text>

      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>
          {filterCategory === 'All' ? 'Total Spent' : `${filterCategory} Total`}
        </Text>
        <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Expense title (e.g., Bus fare, Lunch)"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Amount (e.g., 150)"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />

        <View style={styles.chipRow}>
          {INPUT_CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.addBtn} onPress={handleAddExpense}>
          <Text style={styles.addBtnText}>Add Expense</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Filter by Category</Text>
      <View style={styles.chipRow}>
        {CATEGORIES.map((cat) => {
          const active = filterCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setFilterCategory(cat)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses found for this view.</Text>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    paddingHorizontal: 16,
    paddingTop: 36,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  totalCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
  },
  totalLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    marginBottom: 4,
  },
  totalValue: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  form: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  chipActive: {
    backgroundColor: '#0f766e',
  },
  chipText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#ffffff',
  },
  addBtn: {
    backgroundColor: '#0f766e',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 24,
  },
  expenseCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseLeft: {
    flex: 1,
    paddingRight: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  expenseMeta: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f766e',
  },
  deleteBtn: {
    marginTop: 4,
  },
  deleteText: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    marginTop: 24,
  },
});