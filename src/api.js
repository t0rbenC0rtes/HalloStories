const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Stories API
export const storiesApi = {
	// Get all stories
	async getAll() {
		const response = await fetch(`${API_URL}/api/stories`);
		if (!response.ok) throw new Error('Failed to fetch stories');
		return response.json();
	},

	// Create a new story
	async create(story) {
		const response = await fetch(`${API_URL}/api/stories`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(story),
		});
		if (!response.ok) throw new Error('Failed to create story');
		return response.json();
	},

	// Approve a story (admin)
	async approve(storyId, adminPassword) {
		const response = await fetch(`${API_URL}/api/stories/${storyId}/approve`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-password': adminPassword,
			},
		});
		if (!response.ok) throw new Error('Failed to approve story');
		return response.json();
	},

	// Reject a story (admin)
	async reject(storyId, adminPassword) {
		const response = await fetch(`${API_URL}/api/stories/${storyId}/reject`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				'x-admin-password': adminPassword,
			},
		});
		if (!response.ok) throw new Error('Failed to reject story');
		return response.json();
	},
};

// Votes API
export const votesApi = {
	// Get all votes
	async getAll() {
		const response = await fetch(`${API_URL}/api/votes`);
		if (!response.ok) throw new Error('Failed to fetch votes');
		return response.json();
	},

	// Submit a vote
	async create(vote) {
		const response = await fetch(`${API_URL}/api/votes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(vote),
		});
		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.error || 'Failed to submit vote');
		}
		return response.json();
	},
};

// Game API
export const gameApi = {
	// Reset game (admin)
	async reset(adminPassword) {
		const response = await fetch(`${API_URL}/api/reset`, {
			method: 'DELETE',
			headers: {
				'x-admin-password': adminPassword,
			},
		});
		if (!response.ok) throw new Error('Failed to reset game');
		return response.json();
	},
};
