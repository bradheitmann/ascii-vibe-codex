/**
 * ASCII VIBE CODEX - PersonaEngine
 * CLI-optimized persona system for agent governance
 */

export class PersonaEngine {
  constructor() {
    this.personas = new Map();
    this.activePersona = null;
    this.governanceRules = new Map();
    this.interactionHistory = [];
  }

  /**
   * Registers a CLI-optimized persona
   */
  registerPersona(id, config) {
    const {
      name,
      role,
      traits,
      communicationStyle,
      expertise,
      decisionMaking,
      restrictions = [],
      cliPreferences = {}
    } = config;

    const persona = {
      id,
      name,
      role,
      traits: this.normalizeTraits(traits),
      communicationStyle: this.validateCommunicationStyle(communicationStyle),
      expertise,
      decisionMaking,
      restrictions,
      cliPreferences: {
        verbosity: cliPreferences.verbosity || 'balanced',
        outputFormat: cliPreferences.outputFormat || 'structured',
        errorHandling: cliPreferences.errorHandling || 'informative',
        interactionMode: cliPreferences.interactionMode || 'professional',
        ...cliPreferences
      },
      activationCount: 0,
      lastActivated: null,
      performanceMetrics: {
        successRate: 100,
        userSatisfaction: 0,
        taskCompletionTime: [],
        errorCount: 0
      }
    };

    this.personas.set(id, persona);
    this.registerGovernanceRules(id, persona);
  }

  /**
   * Normalizes trait values to 0-100 scale
   */
  normalizeTraits(traits) {
    const normalized = {};
    for (const [key, value] of Object.entries(traits)) {
      if (typeof value === 'number') {
        normalized[key] = Math.max(0, Math.min(100, value));
      } else if (typeof value === 'string') {
        // Convert string traits to numeric values
        const mapping = {
          'very low': 10, 'low': 25, 'medium': 50, 'high': 75, 'very high': 90,
          'minimal': 10, 'moderate': 50, 'substantial': 75, 'maximum': 95
        };
        normalized[key] = mapping[value.toLowerCase()] || 50;
      }
    }
    return normalized;
  }

  /**
   * Validates communication style parameters
   */
  validateCommunicationStyle(style) {
    const validStyles = {
      tone: ['professional', 'friendly', 'formal', 'casual', 'technical'],
      clarity: ['concise', 'detailed', 'balanced'],
      structure: ['bullet-points', 'paragraphs', 'mixed', 'code-focused'],
      examples: ['minimal', 'balanced', 'extensive']
    };

    const validated = {};
    for (const [key, value] of Object.entries(style)) {
      if (validStyles[key] && validStyles[key].includes(value)) {
        validated[key] = value;
      } else {
        validated[key] = validStyles[key] ? validStyles[key][0] : value;
      }
    }

    return validated;
  }

  /**
   * Registers governance rules for a persona
   */
  registerGovernanceRules(personaId, persona) {
    const rules = {
      maxConcurrentTasks: this.calculateMaxTasks(persona),
      allowedOperations: this.deriveAllowedOperations(persona),
      escalationThresholds: this.setEscalationThresholds(persona),
      qualityGates: this.defineQualityGates(persona),
      timeoutLimits: this.calculateTimeoutLimits(persona)
    };

    this.governanceRules.set(personaId, rules);
  }

  /**
   * Calculates maximum concurrent tasks based on persona traits
   */
  calculateMaxTasks(persona) {
    const efficiency = persona.traits.efficiency || 50;
    const multitasking = persona.traits.multitasking || 50;
    
    return Math.floor((efficiency + multitasking) / 25) + 1; // 1-5 tasks
  }

  /**
   * Derives allowed operations from persona expertise and restrictions
   */
  deriveAllowedOperations(persona) {
    const baseOperations = ['read', 'analyze', 'report', 'recommend'];
    const expertiseOperations = {
      'system-administration': ['configure', 'deploy', 'monitor'],
      'development': ['code', 'test', 'debug', 'refactor'],
      'security': ['audit', 'scan', 'validate', 'restrict'],
      'data-analysis': ['query', 'visualize', 'model', 'predict']
    };

    let allowed = [...baseOperations];
    
    for (const expertise of persona.expertise) {
      if (expertiseOperations[expertise]) {
        allowed.push(...expertiseOperations[expertise]);
      }
    }

    // Remove restricted operations
    return allowed.filter(op => !persona.restrictions.includes(op));
  }

  /**
   * Sets escalation thresholds based on persona decision-making traits
   */
  setEscalationThresholds(persona) {
    const autonomy = persona.traits.autonomy || 50;
    const riskTolerance = persona.traits.riskTolerance || 50;

    return {
      errorRate: Math.max(5, 20 - (autonomy / 10)), // 5-15%
      taskComplexity: Math.min(90, 50 + (autonomy / 2)), // 50-90
      riskLevel: Math.min(80, 30 + (riskTolerance / 2)), // 30-80
      userInterventionRequired: autonomy < 30
    };
  }

  /**
   * Defines quality gates for persona performance
   */
  defineQualityGates(persona) {
    const precision = persona.traits.precision || 50;
    const thoroughness = persona.traits.thoroughness || 50;

    return {
      minimumAccuracy: Math.max(85, 70 + (precision / 5)), // 85-90%
      requiredValidation: thoroughness > 70,
      documentationRequired: thoroughness > 60,
      testingRequired: precision > 70,
      reviewRequired: (precision + thoroughness) / 2 < 60
    };
  }

  /**
   * Calculates timeout limits based on persona traits
   */
  calculateTimeoutLimits(persona) {
    const patience = persona.traits.patience || 50;
    const efficiency = persona.traits.efficiency || 50;

    return {
      taskTimeout: Math.max(30, 120 - (efficiency / 2)), // 30-120 seconds
      userResponseTimeout: Math.max(60, 300 - (patience / 5)), // 60-300 seconds
      systemResponseTimeout: 10 + (patience / 10) // 10-20 seconds
    };
  }

  /**
   * Activates a persona for CLI interaction
   */
  activatePersona(id) {
    const persona = this.personas.get(id);
    if (!persona) {
      throw new Error(`Persona ${id} not found`);
    }

    // Deactivate current persona
    if (this.activePersona) {
      this.deactivatePersona();
    }

    // Activate new persona
    this.activePersona = persona;
    persona.activationCount++;
    persona.lastActivated = Date.now();

    // Log activation
    this.interactionHistory.push({
      type: 'activation',
      personaId: id,
      timestamp: Date.now()
    });

    return this.generateActivationResponse(persona);
  }

  /**
   * Generates persona activation response
   */
  generateActivationResponse(persona) {
    const style = persona.communicationStyle;
    
    let response = '';
    
    switch (style.tone) {
      case 'professional':
        response = `${persona.name} persona activated. Ready to assist with ${persona.role}.`;
        break;
      case 'friendly':
        response = `Hi! I'm ${persona.name}, your ${persona.role}. Let's get started!`;
        break;
      case 'formal':
        response = `${persona.name} persona has been successfully initialized for ${persona.role} operations.`;
        break;
      case 'technical':
        response = `[${persona.id}] ${persona.name} :: ${persona.role} :: STATUS=ACTIVE`;
        break;
      default:
        response = `${persona.name} is now active.`;
    }

    if (style.clarity === 'detailed') {
      response += ` Expertise: ${persona.expertise.join(', ')}. `;
      response += `Capabilities: ${this.governanceRules.get(persona.id).allowedOperations.slice(0, 5).join(', ')}.`;
    }

    return response;
  }

  /**
   * Deactivates the current persona
   */
  deactivatePersona() {
    if (this.activePersona) {
      this.interactionHistory.push({
        type: 'deactivation',
        personaId: this.activePersona.id,
        timestamp: Date.now()
      });
      
      this.activePersona = null;
    }
  }

  /**
   * Processes user input through active persona
   */
  processInput(input, context = {}) {
    if (!this.activePersona) {
      throw new Error('No persona is currently active');
    }

    const persona = this.activePersona;
    const rules = this.governanceRules.get(persona.id);

    // Check governance rules
    const governanceCheck = this.checkGovernance(input, context, rules);
    if (!governanceCheck.allowed) {
      return {
        response: governanceCheck.message,
        escalation: governanceCheck.escalation
      };
    }

    // Process input according to persona traits and style
    return this.generatePersonaResponse(input, context, persona);
  }

  /**
   * Checks governance rules for input
   */
  checkGovernance(input, context, rules) {
    // Check operation permissions
    const requestedOperation = this.extractOperation(input);
    if (requestedOperation && !rules.allowedOperations.includes(requestedOperation)) {
      return {
        allowed: false,
        message: `Operation '${requestedOperation}' not permitted for current persona.`,
        escalation: true
      };
    }

    // Check risk level
    const riskLevel = this.assessRiskLevel(input, context);
    if (riskLevel > rules.escalationThresholds.riskLevel) {
      return {
        allowed: false,
        message: `Risk level too high for autonomous execution. Human review required.`,
        escalation: true
      };
    }

    return { allowed: true };
  }

  /**
   * Extracts operation type from input
   */
  extractOperation(input) {
    const operationKeywords = {
      'delete': 'delete', 'remove': 'delete', 'rm': 'delete',
      'create': 'create', 'make': 'create', 'add': 'create',
      'modify': 'modify', 'edit': 'modify', 'change': 'modify',
      'deploy': 'deploy', 'install': 'deploy',
      'configure': 'configure', 'setup': 'configure',
      'analyze': 'analyze', 'check': 'analyze',
      'test': 'test', 'verify': 'test'
    };

    const words = input.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (operationKeywords[word]) {
        return operationKeywords[word];
      }
    }

    return null;
  }

  /**
   * Assesses risk level of operation
   */
  assessRiskLevel(input, context) {
    let riskScore = 0;

    // High-risk keywords
    const highRiskKeywords = ['delete', 'remove', 'format', 'reset', 'destroy'];
    const mediumRiskKeywords = ['modify', 'change', 'update', 'configure'];

    const words = input.toLowerCase().split(/\s+/);
    
    for (const word of words) {
      if (highRiskKeywords.includes(word)) riskScore += 30;
      if (mediumRiskKeywords.includes(word)) riskScore += 15;
    }

    // Context-based risk factors
    if (context.hasUnsavedChanges) riskScore += 20;
    if (context.isProductionEnvironment) riskScore += 25;
    if (context.affectsMultipleUsers) riskScore += 20;

    return Math.min(100, riskScore);
  }

  /**
   * Generates response based on persona characteristics
   */
  generatePersonaResponse(input, context, persona) {
    const style = persona.communicationStyle;
    const traits = persona.traits;

    // Determine response approach based on traits
    const responseConfig = {
      verbosity: this.calculateVerbosity(traits, style),
      technicalDepth: this.calculateTechnicalDepth(traits, persona.expertise),
      exampleUsage: this.shouldIncludeExamples(traits, style),
      validationLevel: this.calculateValidationLevel(traits)
    };

    return {
      response: `[${persona.name}] Processing request with ${style.tone} approach...`,
      config: responseConfig,
      metadata: {
        personaId: persona.id,
        traits: traits,
        timestamp: Date.now()
      }
    };
  }

  /**
   * Calculates appropriate verbosity level
   */
  calculateVerbosity(traits, style) {
    const detail = traits.thoroughness || 50;
    const efficiency = traits.efficiency || 50;

    if (style.clarity === 'concise' || efficiency > 75) return 'minimal';
    if (style.clarity === 'detailed' || detail > 75) return 'extensive';
    return 'balanced';
  }

  /**
   * Calculates technical depth of response
   */
  calculateTechnicalDepth(traits, expertise) {
    const technical = traits.technicalDepth || 50;
    const hasRelevantExpertise = expertise.length > 0;

    if (technical > 75 && hasRelevantExpertise) return 'deep';
    if (technical > 50) return 'moderate';
    return 'basic';
  }

  /**
   * Determines if examples should be included
   */
  shouldIncludeExamples(traits, style) {
    const helpfulness = traits.helpfulness || 50;
    return style.examples === 'extensive' || 
           (style.examples === 'balanced' && helpfulness > 60);
  }

  /**
   * Calculates validation level required
   */
  calculateValidationLevel(traits) {
    const precision = traits.precision || 50;
    const caution = traits.caution || 50;

    if (precision > 80 || caution > 80) return 'strict';
    if (precision > 60 || caution > 60) return 'moderate';
    return 'basic';
  }

  /**
   * Gets performance metrics for active persona
   */
  getPerformanceMetrics() {
    if (!this.activePersona) return null;

    return {
      personaId: this.activePersona.id,
      name: this.activePersona.name,
      metrics: this.activePersona.performanceMetrics,
      activationCount: this.activePersona.activationCount,
      lastActivated: this.activePersona.lastActivated
    };
  }

  /**
   * Lists all registered personas
   */
  listPersonas() {
    return Array.from(this.personas.values()).map(persona => ({
      id: persona.id,
      name: persona.name,
      role: persona.role,
      expertise: persona.expertise,
      activationCount: persona.activationCount,
      isActive: this.activePersona?.id === persona.id
    }));
  }
}