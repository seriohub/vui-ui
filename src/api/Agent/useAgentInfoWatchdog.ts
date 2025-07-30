import { useApiGet } from '@/hooks/utils/useApiGet';

export const useAgentHealthWatchdog = () => {
  const {
    data,
    getData,
    fetching,
    error
  } = useApiGet();

  const getAgentHealthWatchdog = async () => {
    try {

      return await getData({
        url: '/health/watchdog',
        target: 'agent',
      });

    } catch (e) {
      // Error handling
      // console.error('Error during call:', error);
    } finally {
      // This code will always be executed
    }
  };

  // Return the function for the call and the necessary data
  return {
    getAgentHealthWatchdog,
    data,
    fetching,
    error,
  };
};
