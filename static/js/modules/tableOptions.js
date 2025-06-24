export async function loadTableOptions() {
  try {
    const res = await fetch('/settings/tableOptions');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    // Handle both response formats:
    // 1. Normal response: { tags: [...] }
    // 2. First-run response: { alert: "...", tags: [...] }
    const settingKeys = data.tags || [];
    
    if (data.alert) {
      console.warn('Server message:', data.alert);
    }
    
    console.log('Loaded keys:', settingKeys);
    return settingKeys;
    
  } 
  catch (error) {
    console.error('Failed to load table options:', error);
    // Return default tags if loading fails
    return ['Adjustable', 'Design', 'Gemstone', 'Metal'];    
  }
}

export async function updateTableOptions(newTags) {
  const res = await fetch('/settings/tableOptions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tags: newTags })
  });
  const data = await res.json();
  console.log(data.message);
}


