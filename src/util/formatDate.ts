export const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
        // hour: '2-digit',
        // minute: '2-digit',
        // hour12: true
      });
    } catch (error) {
      return dateString; // Return original string if parsing fails
    }
  };