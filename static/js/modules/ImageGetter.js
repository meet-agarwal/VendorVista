export async function imageGetter() {
  try {
    const response = await fetch('/api/getImages', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    // parse the body even on error so you can see the JSON
    const data = await response.json();

    if (!response.ok) {
      // now you can safely reference data.error
      throw new Error(data.error || "Something went wrong!");
    }

    return data;
  } catch (error) {
    console.error('Error in getting Products Details:', error);
    throw error;
  }
}
