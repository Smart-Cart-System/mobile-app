import { 
  API_BASE_URL, 
  Checklist, 
  ChecklistCreate, 
  ChecklistUpdate, 
  ChecklistItem, 
  ChecklistItemCreate, 
  ChecklistItemUpdate 
} from './types';
import { safeSecureStore } from './secureStore';

/**
 * Checklist service - handles checklist and item management
 */
export const checklistService = {
  /**
   * Get all user checklists
   * @returns Array of checklists with their items
   */
  async getAllChecklists(): Promise<Checklist[]> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Fetching all checklists from API');
      
      const response = await fetch(`${API_BASE_URL}/checklists/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Get checklists API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch checklists:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch checklists');
      }

      const checklists = await response.json();
      console.log('Successfully fetched checklists:', checklists);
      return checklists;
    } catch (error) {
      console.error('Error fetching checklists:', error);
      throw error;
    }
  },

  /**
   * Get a specific checklist by ID
   * @param checklistId The checklist ID
   * @returns Checklist with items
   */
  async getChecklist(checklistId: number): Promise<Checklist> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Fetching checklist from API with ID:', checklistId);
      
      const response = await fetch(`${API_BASE_URL}/checklists/${checklistId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Get checklist API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to fetch checklist:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch checklist');
      }

      const checklist = await response.json();
      console.log('Successfully fetched checklist:', checklist);
      return checklist;
    } catch (error) {
      console.error('Error fetching checklist:', error);
      throw error;
    }
  },

  /**
   * Create a new checklist
   * @param checklistData Checklist creation data
   * @returns Created checklist
   */
  async createChecklist(checklistData: ChecklistCreate): Promise<Checklist> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Creating checklist with data:', checklistData);
      
      const response = await fetch(`${API_BASE_URL}/checklists/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checklistData),
      });

      console.log('Create checklist API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to create checklist:', errorData);
        throw new Error(errorData.detail || 'Failed to create checklist');
      }

      const newChecklist = await response.json();
      console.log('Successfully created checklist:', newChecklist);
      return newChecklist;
    } catch (error) {
      console.error('Error creating checklist:', error);
      throw error;
    }
  },

  /**
   * Update a checklist name
   * @param checklistId The checklist ID
   * @param updateData Updated checklist data
   * @returns Updated checklist
   */
  async updateChecklist(checklistId: number, updateData: ChecklistUpdate): Promise<Checklist> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Updating checklist with ID:', checklistId, 'Data:', updateData);
      
      const response = await fetch(`${API_BASE_URL}/checklists/${checklistId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Update checklist API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update checklist:', errorData);
        throw new Error(errorData.detail || 'Failed to update checklist');
      }

      const updatedChecklist = await response.json();
      console.log('Successfully updated checklist:', updatedChecklist);
      return updatedChecklist;
    } catch (error) {
      console.error('Error updating checklist:', error);
      throw error;
    }
  },

  /**
   * Delete a checklist
   * @param checklistId The checklist ID
   */
  async deleteChecklist(checklistId: number): Promise<void> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Deleting checklist with ID:', checklistId);
      
      const response = await fetch(`${API_BASE_URL}/checklists/${checklistId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      console.log('Delete checklist API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete checklist:', errorData);
        throw new Error(errorData.detail || 'Failed to delete checklist');
      }

      console.log('Successfully deleted checklist');
    } catch (error) {
      console.error('Error deleting checklist:', error);
      throw error;
    }
  },

  /**
   * Add an item to a checklist
   * @param checklistId The checklist ID
   * @param itemData Item creation data
   * @returns Created item
   */
  async addItem(checklistId: number, itemData: ChecklistItemCreate): Promise<ChecklistItem> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Adding item to checklist ID:', checklistId, 'Item data:', itemData);
      
      const response = await fetch(`${API_BASE_URL}/checklists/${checklistId}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      console.log('Add item API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to add item:', errorData);
        throw new Error(errorData.detail || 'Failed to add item');
      }

      const newItem = await response.json();
      console.log('Successfully added item:', newItem);
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  },

  /**
   * Update a checklist item
   * @param checklistId The checklist ID
   * @param itemId The item ID
   * @param updateData Updated item data
   * @returns Updated item
   */
  async updateItem(checklistId: number, itemId: number, updateData: ChecklistItemUpdate): Promise<ChecklistItem> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Updating item ID:', itemId, 'in checklist ID:', checklistId, 'Data:', updateData);
      
      const response = await fetch(`${API_BASE_URL}/checklists/${checklistId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('Update item API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to update item:', errorData);
        throw new Error(errorData.detail || 'Failed to update item');
      }

      const updatedItem = await response.json();
      console.log('Successfully updated item:', updatedItem);
      return updatedItem;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  },

  /**
   * Delete a checklist item
   * @param checklistId The checklist ID
   * @param itemId The item ID
   */
  async deleteItem(checklistId: number, itemId: number): Promise<void> {
    try {
      const userToken = await safeSecureStore.getItemAsync('userToken');
      console.log('Deleting item ID:', itemId, 'from checklist ID:', checklistId);
      
      const response = await fetch(`${API_BASE_URL}/checklists/${checklistId}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      console.log('Delete item API response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Failed to delete item:', errorData);
        throw new Error(errorData.detail || 'Failed to delete item');
      }

      console.log('Successfully deleted item');
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  },
};
