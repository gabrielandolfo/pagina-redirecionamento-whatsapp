// ========================================
// CONFIGURAÇÕES DO SISTEMA DE REDIRECIONAMENTO
// ========================================

// 🔴 META ADS PIXEL
const META_PIXEL_ID = '1242065550945306';

// 🔴 SUPABASE - CONFIGURAÇÕES DO BANCO
// ⚠️ ALTERE ESTAS CREDENCIAIS COM SUAS INFORMAÇÕES REAIS
const SUPABASE_URL = 'https://faadgeevxgrzcpgpxnkw.supabase.co'; // ← COLE SUA URL REAL AQUI
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhYWRnZWV2eGdyemNwZ3B4bmt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTQ3MzYxMiwiZXhwIjoyMDcxMDQ5NjEyfQ.A6jclfrrSU_onzxIeQrSy8DToh5Vrx1WZrONkrviEvA'; // ← COLE SUA CHAVE ANÔNIMA REAL AQUI

// 🔴 WHATSAPP - CONFIGURAÇÕES
const WHATSAPP_FALLBACK = '5535991712235'; // ← ALTERE AQUI
const BASE_MESSAGE = 'Olá! Quero receber os materiais! Cupom: ';

// 🔗 WEBHOOK - CONFIGURAÇÕES
const PREHOOK_URL = 'https://webhook.servidorrrdigital.site/webhook/redirect';

// ⚙️ CONFIGURAÇÕES AVANÇADAS
const REDIRECT_DELAY = 5000;
const DEDUPE_TTL_MS = 5 * 60 * 1000; // 5 min
const WEBHOOK_RETRY_DELAY = 2000;
const MAX_WEBHOOK_RETRIES = 5;
const IP_TIMEOUT = 8000;
const GEO_TIMEOUT = 10000;

// ========================================
// EXPOSIÇÃO DAS VARIÁVEIS GLOBAIS
// ========================================

// ⚠️ IMPORTANTE: Estas variáveis devem estar disponíveis globalmente
window.META_PIXEL_ID = META_PIXEL_ID;
window.SUPABASE_URL = SUPABASE_URL;
window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
window.WHATSAPP_FALLBACK = WHATSAPP_FALLBACK;
window.BASE_MESSAGE = BASE_MESSAGE;
window.PREHOOK_URL = PREHOOK_URL;
window.REDIRECT_DELAY = REDIRECT_DELAY;
window.DEDUPE_TTL_MS = DEDUPE_TTL_MS;
window.WEBHOOK_RETRY_DELAY = WEBHOOK_RETRY_DELAY;
window.MAX_WEBHOOK_RETRIES = MAX_WEBHOOK_RETRIES;
window.IP_TIMEOUT = IP_TIMEOUT;
window.GEO_TIMEOUT = GEO_TIMEOUT;

// ========================================
// SISTEMA DE CONFIGURAÇÃO NO SUPABASE
// ========================================

// Cache local das configurações
let configCache = {};
let configCacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Função para obter configuração do Supabase
async function getConfigFromSupabase(key, defaultValue) {
  try {
    // Verifica cache primeiro
    if (configCache[key] && Date.now() < configCacheExpiry) {
      // Configuração carregada do cache
      return configCache[key];
    }

    // Busca no Supabase
    const response = await fetch(`${SUPABASE_URL}/rest/v1/system_config?config_key=eq.${encodeURIComponent(key)}`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data && data.length > 0) {
        const configValue = data[0].config_value;
        
        // Atualiza cache
        configCache[key] = configValue;
        configCacheExpiry = Date.now() + CACHE_TTL_MS;
        
        // Configuração carregada do Supabase
        return configValue;
      }
    }
  } catch (error) {
    // Erro ao buscar configuração no Supabase
  }

  // Fallback para localStorage
  try {
    const localValue = localStorage.getItem(`config_${key}`);
    if (localValue) {
      // Configuração carregada do localStorage
      return localValue;
    }
  } catch (e) {
    // localStorage não disponível
  }

  // Usa valor padrão
  // Usando valor padrão
  return defaultValue;
}

// Função para obter configuração com fallback
async function getConfig(key, defaultValue) {
  // 1. Tenta variável de ambiente (produção)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    // Configuração carregada via variável de ambiente
    return process.env[key];
  }
  
  // 2. Tenta Supabase (com cache)
  const supabaseValue = await getConfigFromSupabase(key, defaultValue);
  if (supabaseValue !== defaultValue) {
    return supabaseValue;
  }
  
  // 3. Usa valor padrão
  return defaultValue;
}

// Configurações com sistema de fallback
const SYSTEM_CONFIG = {
  META_PIXEL_ID: getConfig('META_PIXEL_ID', META_PIXEL_ID),
  SUPABASE_URL: getConfig('SUPABASE_URL', SUPABASE_URL),
  SUPABASE_ANON_KEY: getConfig('SUPABASE_ANON_KEY', SUPABASE_ANON_KEY),
  WHATSAPP_FALLBACK: getConfig('WHATSAPP_FALLBACK', WHATSAPP_FALLBACK),
  BASE_MESSAGE: getConfig('BASE_MESSAGE', BASE_MESSAGE),
  PREHOOK_URL: getConfig('PREHOOK_URL', PREHOOK_URL),
  REDIRECT_DELAY: getConfig('REDIRECT_DELAY', REDIRECT_DELAY),
  DEDUPE_TTL_MS: getConfig('DEDUPE_TTL_MS', DEDUPE_TTL_MS),
  WEBHOOK_RETRY_DELAY: getConfig('WEBHOOK_RETRY_DELAY', WEBHOOK_RETRY_DELAY),
  MAX_WEBHOOK_RETRIES: getConfig('MAX_WEBHOOK_RETRIES', MAX_WEBHOOK_RETRIES),
  IP_TIMEOUT: getConfig('IP_TIMEOUT', IP_TIMEOUT),
  GEO_TIMEOUT: getConfig('GEO_TIMEOUT', GEO_TIMEOUT)
};

// Exporta as configurações
window.SYSTEM_CONFIG = SYSTEM_CONFIG;

// ========================================
// FUNÇÕES DE CONFIGURAÇÃO DINÂMICA
// ========================================

// Função para atualizar configuração em tempo real
window.updateConfig = async function(key, value) {
  try {
    // Atualiza no Supabase (se possível)
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://your-project.supabase.co') {
      try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/system_config?config_key=eq.${encodeURIComponent(key)}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            config_value: value,
            updated_at: new Date().toISOString()
          })
        });

        if (response.ok) {
          // Configuração atualizada no Supabase
          
          // Atualiza cache
          configCache[key] = value;
          configCacheExpiry = Date.now() + CACHE_TTL_MS;
        } else {
          // Falha ao atualizar no Supabase, usando localStorage
          // Fallback para localStorage
          localStorage.setItem(`config_${key}`, value);
        }
      } catch (supabaseError) {
        // Erro no Supabase, usando localStorage
        localStorage.setItem(`config_${key}`, value);
      }
    } else {
      // Supabase não configurado, usa localStorage
      localStorage.setItem(`config_${key}`, value);
    }
    
    // Atualiza configuração atual
    window.SYSTEM_CONFIG[key] = value;
    
    // Configuração atualizada
    return true;
  } catch (error) {
    // Erro ao atualizar configuração
    return false;
  }
};

// Função para listar todas as configurações
window.listConfig = function() {
  // Listando configurações atuais
  return window.SYSTEM_CONFIG;
};

// Função para carregar todas as configurações do Supabase
window.loadAllConfigFromSupabase = async function() {
  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL === 'https://your-project.supabase.co') {
      // Supabase não configurado
      return false;
    }

    // Carregando configurações do Supabase
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/system_config?select=config_key,config_value,description,is_sensitive&order=config_key.asc`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const configs = await response.json();
      
      // Atualiza cache e configurações
      configs.forEach(config => {
        configCache[config.config_key] = config.config_value;
        window.SYSTEM_CONFIG[config.config_key] = config.config_value;
      });
      
      configCacheExpiry = Date.now() + CACHE_TTL_MS;
      
      // Configurações carregadas do Supabase
      return true;
    } else {
      // Erro ao carregar configurações do Supabase
      return false;
    }
  } catch (error) {
    // Erro ao carregar configurações do Supabase
    return false;
  }
};

// Função para sincronizar configurações
window.syncConfig = async function() {
  // Sincronizando configurações
  
  // Limpa cache
  configCache = {};
  configCacheExpiry = 0;
  
  // Recarrega do Supabase
  const success = await window.loadAllConfigFromSupabase();
  
  if (success) {
    // Configurações sincronizadas com sucesso
  } else {
    // Usando configurações locais como fallback
  }
  
  return success;
};

// Função para resetar configurações para valores padrão
window.resetConfig = async function() {
  try {
    // Resetando configurações
    
    // Remove todas as configurações do localStorage
    Object.keys(window.SYSTEM_CONFIG).forEach(key => {
      localStorage.removeItem(`config_${key}`);
    });
    
    // Limpa cache
    configCache = {};
    configCacheExpiry = 0;
    
    // Se Supabase estiver configurado, tenta resetar lá também
    if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL !== 'https://your-project.supabase.co') {
      try {
        // Busca configurações padrão do arquivo
        const defaultConfigs = {
          'META_PIXEL_ID': '1722654601715514',
          'SUPABASE_URL': SUPABASE_URL,
          'SUPABASE_ANON_KEY': SUPABASE_ANON_KEY,
          'WHATSAPP_FALLBACK': '5511999999999',
          'BASE_MESSAGE': 'Olá! Quero receber os materiais! Cupom: ',
          'PREHOOK_URL': 'https://n8n.granapdf.com/webhook/redirect',
          'REDIRECT_DELAY': '5000',
          'DEDUPE_TTL_MS': '300000',
          'WEBHOOK_RETRY_DELAY': '2000',
          'MAX_WEBHOOK_RETRIES': '5',
          'IP_TIMEOUT': '8000',
          'GEO_TIMEOUT': '10000'
        };
        
        // Atualiza cada configuração no Supabase
        for (const [key, value] of Object.entries(defaultConfigs)) {
          try {
            await fetch(`${SUPABASE_URL}/rest/v1/system_config?config_key=eq.${encodeURIComponent(key)}`, {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify({
                config_value: value,
                updated_at: new Date().toISOString()
              })
            });
          } catch (updateError) {
            // Erro ao resetar no Supabase
          }
        }
        
        // Configurações resetadas no Supabase
      } catch (supabaseError) {
        // Erro ao resetar no Supabase
      }
    }
    
    // Recarrega a página para aplicar valores padrão
    // Recarregando página
    setTimeout(() => location.reload(), 1000);
    
    return true;
  } catch (error) {
    // Erro ao resetar configurações
    return false;
  }
};

// ========================================
// VERIFICAÇÃO DE CONFIGURAÇÃO
// ========================================

// Verifica se as configurações críticas estão definidas
function validateConfig() {
  const criticalKeys = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'];
  const missingKeys = criticalKeys.filter(key => {
    const value = window.SYSTEM_CONFIG[key];
    return !value || value === 'your-project.supabase.co' || value === 'your-anon-key';
  });
  
  if (missingKeys.length > 0) {
    // Configurações críticas não definidas
    return false;
  }
  
  // Todas as configurações críticas estão definidas
  return true;
}

// Executa validação
validateConfig();

// Carrega configurações do Supabase automaticamente
(async function() {
  try {
    await window.loadAllConfigFromSupabase();
    // Configurações carregadas do Supabase
  } catch (error) {
    // Usando configurações padrão
  }
})();

// Configurações carregadas - use window.updateConfig(), listConfig(), loadAllConfigFromSupabase(), syncConfig() ou resetConfig()
