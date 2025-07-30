'use client';

import { useEffect } from 'react';
import { useAppStatus } from '@/contexts/AppContext';

import { useServerStatus } from '@/contexts/ServerContext';
import { useAgentStatus } from '@/contexts/AgentContext';
import { useSocketStatus } from '@/contexts/SocketContext';
import { useAgentConfiguration } from '@/api/Agent/useAgentConfiguration';
import { useAppInfoOrigins } from "@/api/Agent/useAppInfoOrigins";
import { useAgentHealthWatchdog } from "@/api/Agent/useAgentInfoWatchdog";
import { useAppInfoArch } from "@/api/Agent/useAppInfoArch";
import { useCoreAgents } from "@/api/Core/useCoreAgents";
import { useClusterHealth } from "@/api/Agent/useClusterHealth";
import { useAppVersion } from "@/api/App/useAppVersion";

export interface AgentApiConfig {
  name: string;
  url: string;
  ws: string;
}

export const useAgentConfig = () => {
  const appValues = useAppStatus();
  const serverValues = useServerStatus();
  const agentValues = useAgentStatus();
  const socketValues = useSocketStatus();

  const {
    getAppVersion
  } = useAppVersion();

  const {
    getAgentConfiguration
  } = useAgentConfiguration();

  const {
    getAppInfoOrigins
  } = useAppInfoOrigins();

  const {
    getAppInfoArch
  } = useAppInfoArch();

  const {
    getCoreAgents
  } = useCoreAgents();

  const {
    getClusterHealth
  } = useClusterHealth();

  const {
    getAgentHealthWatchdog
  } = useAgentHealthWatchdog();

  // setCurrentAgent
  useEffect(() => {
    if (serverValues.isCurrentServerControlPlane && appValues.isAuthenticated && serverValues.isServerAvailable) {
      getCoreAgents().then(response => {
        if (serverValues.isCurrentServerControlPlane) {
          if (response !== undefined) {
            agentValues.setAgents(response);
            const agentIndex =
              localStorage.getItem('agent') &&
              Number(localStorage.getItem('agent')) < response?.length
                ? Number(localStorage.getItem('agent'))
                : 0;

            agentValues.setCurrentAgent(response[agentIndex]);
          } else {
            agentValues.setCurrentAgent(undefined);
          }
        }

      });
    }

    if (serverValues.isCurrentServerControlPlane == false && serverValues.currentServer && serverValues.isServerAvailable) {
      agentValues.setCurrentAgent(serverValues.currentServer);
    }
  }, [serverValues.isCurrentServerControlPlane, appValues.isAuthenticated, agentValues.reload, serverValues.isServerAvailable, serverValues.currentServer]);

  useEffect(() => {
    if (agentValues.isAgentAvailable && agentValues.currentAgent && appValues.isAuthenticated) {
      getAgentConfiguration().then(response => {
        agentValues.setAgentConfig(response);
      })
      getAppVersion().then(response => {
        agentValues.setVeleroInstalledVersion(response)
      })
    }
    if (agentValues.isAgentAvailable && agentValues.currentAgent && (serverValues.isCurrentServerControlPlane == false || (serverValues.isCurrentServerControlPlane == true && appValues.isAuthenticated))) {
      getClusterHealth().then(response => {
        agentValues.setK8sHealth(response)
      });
      getAgentHealthWatchdog().then(response => {
        agentValues.setWatchdogStatus(response)
      });
      getAppInfoOrigins().then(response => {
        agentValues.setOrigins(response)
      });
      getAppInfoArch().then(response => {
        agentValues.setArch(response)
      });
    }
  }, [agentValues.isAgentAvailable, appValues.isAuthenticated, agentValues.currentAgent]);

  // set current agent available
  useEffect(() => {
    if (serverValues.isCurrentServerControlPlane == true) {
      const checkAgentStatus = async () => {
        if (
          serverValues.isServerAvailable &&
          serverValues.isCurrentServerControlPlane &&
          appValues.isAuthenticated
        ) {
          console.warn(
            `Server is core type. Send a request to confirm ${agentValues.currentAgent?.name}'s availability.`
          );
          const message =
            {
              type: "agent_alive",
              kind: "request",
              payload: {
                agent_name: agentValues.currentAgent?.name,
              },
              request_id: `req-${Date.now()}`,
              timestamp: new Date().toISOString(),
            };
          socketValues.sendMessageToSocket(JSON.stringify(message));
        }
      };
      checkAgentStatus();
      const interval = setInterval(checkAgentStatus, 15000);
      return () => clearInterval(interval);
    }

    if (serverValues.isCurrentServerControlPlane == false) {
      if (agentValues.isAgentAvailable !== serverValues.isServerAvailable) {
        agentValues.setIsAgentAvailable(serverValues.isServerAvailable);
      }
    }
    return undefined;
  }, [
    agentValues.currentAgent,
    serverValues.isServerAvailable,
    serverValues.isCurrentServerControlPlane,
  ]);

};
