# MCP Tool Development Best Practices

## AI-Optimized Tool Design Guide

**AUTHORITATIVE REFERENCE** for all MCP tool development, schema design, and visual conventions.

This document defines the mandatory standards for developing MCP tools optimized for AI agent usage, ensuring tools are easily discoverable, properly invoked, and accurately interpreted by LLMs.

## Table of Contents
- [Tool Description Structure](#tool-description-structure)
- [Schema Description Principles](#schema-description-principles)
- [Parameter Guidance Patterns](#parameter-guidance-patterns)
- [Output Schema Enhancement](#output-schema-enhancement)
- [Visual Conventions](#visual-conventions)
- [Master Emoji Reference](#master-emoji-reference)
- [Error Handling Guidelines](#error-handling-guidelines)
- [Performance Considerations](#performance-considerations)
- [Documentation Standards](#documentation-standards)
- [Validation Checklist](#validation-checklist)
- [Development Workflows](#development-workflows)
- [Templates and Examples](#templates-and-examples)

---

## Tool Description Structure

### 1. Opening Summary
- **Brief tool purpose** in 1-2 sentences
- **Essential capabilities** and primary use cases
- **Context positioning** within the larger system

### 2. Quick Decision Guide (🎯)
```
🎯 QUICK DECISION GUIDE:
├── Need X? → Use for Y
├── Need A? → Focus on B parameter
├── Need C? → Filter by D: "value1" vs "value2"
├── Need E? → Analyze F and G combinations
└── Need H? → Check I field for J indicators
```

**Purpose**: Provide branching logic for tool selection and parameter choices.

**Guidelines**:
- 5-7 decision branches maximum
- Use concrete scenarios, not abstract concepts
- Include specific parameter recommendations
- Order by frequency of use (most common first)

### 3. Critical Rules (❌)
```
❌ CRITICAL RULES:
• Parameter constraints and validation requirements
• Known limitations and error conditions
• Time range restrictions or data availability
• Required vs optional parameter behavior
• Breaking changes or deprecated features
```

**Purpose**: Prevent common errors and misuse.

**Guidelines**:
- Lead with constraints that cause API errors
- Highlight time-sensitive limitations
- Document parameter validation rules
- Include known breaking combinations

### 4. High-Value Patterns (✅)
```
✅ HIGH-VALUE PATTERNS:

1. PATTERN NAME:
   {parameter_example: "value"} → Specific outcome
   
2. ANOTHER PATTERN:
   {parameter_combination} → Expected result
```

**Purpose**: Provide concrete parameter examples with expected outcomes.

**Guidelines**:
- 3-5 patterns maximum
- Include actual JSON parameter examples
- Describe specific business outcomes
- Order by business value/frequency

### 5. Technical Insights (⚠️)
- **Parameter behavior** and interaction effects
- **Response structure** variations
- **Performance implications** 
- **Environment-specific notes**

### 6. Optimal Workflows (🚀)
```
🚀 OPTIMAL WORKFLOWS:

1. WORKFLOW NAME:
   - Step 1: Specific action
   - Step 2: Based on step 1 result
   - Step 3: Final analysis

2. ANOTHER WORKFLOW:
   - Progressive discovery approach
   - Refinement based on findings
```

**Purpose**: Guide multi-step analysis processes.

**Guidelines**:
- 3-4 workflows maximum
- Include conditional logic between steps
- Reference specific tool features
- Show progressive refinement patterns

---

## Schema Description Principles

### Input Parameters

#### Structure Pattern:
```typescript
parameterName: z
    .type()
    .constraints()
    .describe(
        '🔧 PARAMETER TYPE: Brief description. ⚠️ IMPACT LEVEL: Specific behavior notes. 💡 USE CASE: When to use this parameter. COMBINE WITH: Related parameters.',
    ),
```

#### Impact Level Classification:
- **🚨 HIGH IMPACT**: Can reduce results to zero or cause major changes
- **⚠️ MODERATE IMPACT**: Affects results but usually returns data
- **✅ LOW IMPACT**: Minimal effect on result scope

#### Required Elements:
1. **Visual indicator** (emoji for quick scanning)
2. **Parameter classification** (filter, control, lookup, etc.)
3. **Impact assessment** with specific behavioral notes
4. **Use case guidance** with concrete scenarios
5. **Combination recommendations** with other parameters

#### Parameter Description Template:
```
'🔧 TYPE: Primary function. ⚠️ IMPACT: Effect on results (specific behavior). 💡 USE CASE: When to use (concrete scenario). COMBINE WITH: Related parameters for enhanced analysis.'
```

### Output Schema Enhancement

#### Schema Robustness Requirements

**CRITICAL**: All output/response schemas MUST include `.optional()` and `.passthrough()` to prevent MCP errors:

```typescript
// ❌ BAD - Will cause MCP errors when API returns unexpected data
export const BadResponseSchema = z.object({
    result: z.boolean(),
    message: z.string(),
    content: z.array(SomeSchema),
});

// ✅ GOOD - Robust schema that handles API variations
export const GoodResponseSchema = z.object({
    result: z.boolean().optional(),
    message: z.string().optional(), 
    content: z.array(SomeSchema).optional(),
})
.passthrough();
```

**Why This Matters**:
- **`.optional()`**: Prevents errors when APIs don't return expected fields
- **`.passthrough()`**: Allows additional undocumented fields from API responses
- **Forward Compatibility**: Handles API changes without breaking existing tools
- **Error Resilience**: Graceful handling of malformed or partial responses

#### Required Schema Patterns:

```typescript
// Response wrapper pattern
export const ResponseSchema = z
    .object({
        result: z.boolean().optional().describe('...'),
        message: z.string().optional().describe('...'),
        content: ContentSchema.optional().describe('...'),
    })
    .passthrough()
    .describe('...');

// Nested object pattern  
export const NestedSchema = z
    .object({
        field1: z.string().optional().describe('...'),
        field2: z.number().optional().describe('...'),
        nested: z.array(AnotherSchema).optional().describe('...'),
    })
    .passthrough()
    .describe('...');

// Array element pattern
export const ElementSchema = z
    .object({
        id: z.string().optional().describe('...'),
        data: z.record(z.any()).optional().describe('...'),
    })
    .passthrough()
    .describe('...');
```

#### Schema Design Checklist:
- [ ] **All object schemas** use `.passthrough()`
- [ ] **All fields** are marked `.optional()` unless guaranteed by API
- [ ] **Nested objects** follow the same robustness patterns
- [ ] **Array elements** have robust schemas with optional fields
- [ ] **Complex types** handle null/undefined gracefully

#### Field-Level Descriptions:
```typescript
fieldName: z
    .type()
    .optional()
    .describe(
        '📊 FIELD PURPOSE: What this field represents. BUSINESS CONTEXT: Why it matters. USE FOR: Specific analysis applications. THRESHOLDS: Decision points or significant values.',
    ),
```

#### Schema-Level Descriptions:
```typescript
.describe(
    '📦 SCHEMA PURPOSE: What this structure contains. USAGE CONTEXT: When this data is most valuable. KEY PATTERNS: Important relationships between fields.',
)
```

#### Required Elements:
1. **Data interpretation** guidance
2. **Business context** and significance
3. **Decision thresholds** and key values
4. **Cross-reference** capabilities
5. **Pattern recognition** hints

---

## Parameter Guidance Patterns

### 1. Filtering Parameters
- **Start broad, filter down**: Always recommend default values first
- **Combination effects**: Explain multiplicative filtering
- **Zero result scenarios**: When filters may return empty data
- **Performance impact**: Large vs small result sets

### 2. Pagination Parameters
- **Exploration strategy**: Start small (5-10), scale up (20-50)
- **Maximum limits**: Document API constraints
- **Total count usage**: How to estimate dataset size
- **Performance considerations**: Balance detail vs speed

### 3. Time Range Parameters
- **Validation constraints**: API-enforced limitations
- **Granularity effects**: How time windows affect detail
- **Recent vs historical**: Data freshness considerations
- **Error handling**: How to interpret time validation errors

### 4. Identifier Parameters
- **Format requirements**: Expected patterns and validation
- **Cross-reference usage**: How to connect with other data
- **Availability patterns**: When identifiers might be null
- **Deep-dive workflows**: Progressive analysis approaches

---

## Output Schema Enhancement

### Response Wrapper Patterns
```typescript
ResponseSchema = z.object({
    result: z.boolean().optional().describe(
        '✅ API SUCCESS: Indicates successful operation. False values require checking message field for error details and potential parameter adjustment.',
    ),
    message: z.string().optional().describe(
        '💬 STATUS MESSAGE: Human-readable response status. Critical for error handling, debugging parameter issues, and understanding API constraints.',
    ),
    content: DataSchema.optional().describe(
        '📊 MAIN PAYLOAD: Primary data when result=true. Contains [specific data type]. Null when API errors occur.',
    ),
})
```

### Data Field Enhancement Guidelines

#### Numeric Fields:
- **Value ranges** and typical distributions
- **Threshold significance** (e.g., ">100 indicates high intensity")
- **Comparison context** (relative to other fields)
- **Business impact** interpretation

#### String Fields:
- **Format patterns** and examples
- **Enumeration values** when applicable
- **Cross-reference usage** with other fields
- **Parsing requirements** for complex strings

#### Array Fields:
- **Empty array meaning** (no data vs filtered out)
- **Element relationships** and ordering
- **Length significance** (what counts indicate)
- **Iteration patterns** for analysis

#### Complex Objects:
- **Nested field priorities** (which to examine first)
- **Relationship patterns** between fields
- **Conditional logic** (when fields might be null)
- **Analysis workflows** for complex structures

---

## Visual Conventions

### Cognitive Benefits of Visual Indicators

#### For AI Processing (Primary Benefits):
Visual indicators function as **cognitive anchors** that significantly enhance AI text processing efficiency:

- **Pattern Recognition**: Rapid identification of information types without semantic analysis
- **Information Chunking**: Breaking complex documentation into semantically meaningful units
- **Rapid Scanning**: Non-linear navigation to relevant sections based on visual cues
- **Consistent Mental Models**: Maintaining systematic categorization frameworks across tools
- **Context Switching**: Efficient transitions between different analysis modes (parameters → outputs → workflows)

Visual indicators create **semantic bookmarks** that enable systematic thinking at scale, similar to how syntax highlighting aids code parsing. They prevent regression to generic, unstructured descriptions by maintaining visual vocabulary consistency.

#### For Human Developers (Secondary Benefits):
- **Reduced Cognitive Load**: Immediate visual context about information hierarchy and types
- **Improved Accessibility**: More approachable dense technical documentation
- **Faster Navigation**: Quick identification of relevant sections during development
- **Modern Documentation Style**: Enhanced readability and professional presentation

#### Why This Works:
Visual indicators create a **structured vocabulary** that enables both AI systems and humans to maintain rigorous documentation standards. They function as external memory aids that preserve systematic approaches across different tools and contexts.

### Emoji Usage Standards

#### Tool Structure Categories:
- 🎯 **Decision Logic**: Quick guides and branching scenarios
- ❌ **Constraints**: Critical rules and limitations  
- ✅ **Patterns**: High-value usage examples and recommendations
- ⚠️ **Warnings**: Important behavioral notes and cautions
- 🚀 **Workflows**: Multi-step processes and methodologies

#### Parameter Classification:
- 🔧 **Controls**: Pagination, sizing, formatting parameters
- 🎯 **Filters**: Data subset selection and scoping
- 🔍 **Lookups**: Specific entity targeting and deep-dive analysis
- 🌐 **Scope**: Platform, source, type filters
- ⏰ **Temporal**: Time ranges and intervals
- 💡 **Strategy**: Usage guidance and recommendations

#### Data Field Categories:
- 📊 **Metrics**: Numeric values and measurements
- 🏷️ **Identifiers**: IDs, names, categories, and labels
- 📈 **Analytics**: Calculated values and insights
- 📋 **Collections**: Arrays and lists
- 🔢 **Totals**: Count values and summations
- 📝 **Documentation**: Descriptions and explanatory text

#### Time-Related Field Categories:
- ⏰ **Start/Creation/Detection**: When something begins (TIME RANGE START, ATTACK START, DETECTION TIMESTAMP, DISCOVERY TIMESTAMP)
- 🏁 **End/Completion/Finish**: When something definitively concludes (TIME RANGE END, ATTACK END - checkered flag = finish line)
- 🕐 **Current/Latest/Status**: Most recent or current state (LATEST ACTIVITY, LATEST OCCURRENCE, LATEST OBSERVATION)
- ⏱️ **Measurement/Interval/Rate**: Time calculations and metrics (INTERVAL TIMESTAMP, RATE CALCULATION BASIS, DATA FRESHNESS)

**AI Processing Benefits**:
- **Pattern Recognition**: Instant visual identification of time field types
- **Decision Logic**: Clear semantic meaning guides parameter selection
- **Context Awareness**: Understand time field purposes without semantic analysis
- **Consistency**: Eliminates confusion between similar time concepts

**Developer Benefits**:
- **Intuitive Understanding**: Visual metaphors match conceptual meaning
- **Quick Scanning**: Rapid identification of time field categories in documentation
- **Reduced Errors**: Clear semantic boundaries prevent misuse
- **Professional Documentation**: Consistent visual vocabulary across all schemas

#### Response Structure Elements:
- ✅ **Success**: API status and validation indicators
- 💬 **Messages**: Status and error information
- 📦 **Containers**: Response wrappers and primary payloads
- 📚 **Inventories**: Complete data collections and catalogs

#### Security and Operational Indicators:
- 🚨 **High Impact**: Critical parameters that can drastically affect results
- 🛡️ **Security**: Protection, blocking, and defense-related fields
- 🧪 **Simulation**: Test modes and simulated actions
- 🤖 **Automation**: Bot traffic and automated behavior
- 🔄 **Operational State**: Status indicators and system health
- ⚡ **Intensity**: Rate-based metrics and performance indicators
- 🎓 **Sophistication**: Assessment levels and threat classifications

#### Business Context Indicators:
- 🏢 **Application**: Business applications and organizational context
- 🌐 **Cross-Domain**: Multi-domain and infrastructure relationships
- 📈 **Volume**: Traffic volumes and scale metrics
- 🎯 **Targeting**: Attack targets and focus areas

### Color Coding (Text-Based):
- **RED (❌⚠️🚨)**: Warnings, errors, constraints, high-impact changes
- **GREEN (✅💡)**: Success, patterns, recommendations, guidance
- **BLUE (🔧📊🔍)**: Technical details, controls, analysis tools
- **YELLOW (🎯⚡)**: Decision points, priorities, performance metrics

---

## Master Emoji Reference

**AUTHORITATIVE EMOJI VOCABULARY** - All MCP tool development must follow this reference.

### Tool Structure Categories:
- 🎯 **Decision Logic**: Quick guides and branching scenarios
- ❌ **Constraints**: Critical rules and limitations  
- ✅ **Patterns**: High-value usage examples and recommendations
- ⚠️ **Warnings**: Important behavioral notes and cautions
- 🚀 **Workflows**: Multi-step processes and methodologies

### Parameter Classification:
- 🔧 **Controls**: Pagination, sizing, formatting parameters
- 🎯 **Filters**: Data subset selection and scoping
- 🔍 **Lookups**: Specific entity targeting and deep-dive analysis
- 🌐 **Scope**: Platform, source, type filters
- 💡 **Strategy**: Usage guidance and recommendations
- 🚫 **Exclusions**: Status filters and negative selections
- 📄 **Pagination**: Page control and navigation
- 📊 **Size Control**: Result limiting and performance management

### Time-Related Fields (Standardized System):
- ⏰ **Start/Creation/Detection**: When something begins
  - TIME RANGE START, ATTACK START, DETECTION TIMESTAMP, DISCOVERY TIMESTAMP
- 🏁 **End/Completion/Finish**: When something definitively concludes  
  - TIME RANGE END, ATTACK END (checkered flag = finish line)
- 🕐 **Current/Latest/Status**: Most recent or current state
  - LATEST ACTIVITY, LATEST OCCURRENCE, LATEST OBSERVATION
- ⏱️ **Measurement/Interval/Rate**: Time calculations and metrics
  - INTERVAL TIMESTAMP, RATE CALCULATION BASIS, DATA FRESHNESS
- 📅 **Date Context**: Date formatting and temporal context

### Data Field Categories:
- 📊 **Metrics**: Numeric values and measurements
- 🏷️ **Identifiers**: IDs, names, categories, and labels
- 📈 **Analytics**: Calculated values and insights
- 📋 **Collections**: Arrays and lists
- 🔢 **Totals**: Count values and summations
- 📝 **Documentation**: Descriptions and explanatory text

### Security and Risk Assessment:
- 🚨 **High Impact/Severity**: Critical parameters, vulnerabilities, high-risk items
- 🛡️ **Security/Protection**: Blocking, defense-related fields
- 🧪 **Simulation/Testing**: Test modes, simulated actions
- 🔄 **Operational State**: Status indicators, workflow tracking
- ⚡ **Intensity/Performance**: Rate-based metrics, performance indicators
- 🎓 **Sophistication**: Assessment levels, threat classifications
- 👁️ **Review/Monitoring**: Under review status, observation
- 🚫 **Exclusion/Blocking**: Status exclusions, blocked content

### Technical and System Context:
- 🤖 **Automation/Bots**: Bot traffic, automated behavior
- 🖥️ **UI/Integration**: User interface, frontend integration
- 🗄️ **Storage/Data**: Data storage, browser storage access
- 🔑 **Cryptographic/Keys**: Hashes, unique identifiers, keys
- 📦 **Components/Packages**: Software packages, libraries, containers
- 🔧 **Technical Tools**: Controls, configuration, technical parameters

### Business and Application Context:
- 🏢 **Application/Organization**: Business applications, organizational context
- 🌐 **Network/Domain**: Cross-domain activity, hosting, network relationships
- 🎯 **Targeting/Focus**: Attack targets, specific focus areas
- 📈 **Volume/Scale**: Traffic volumes, scale metrics
- 💳 **Financial/Payment**: Payment-related, financial transactions
- 🔐 **Authentication**: Login, authentication-related
- 🛍️ **Commerce**: Shopping, product-related activities

### Response Structure Elements:
- ✅ **Success**: API status and validation indicators
- 💬 **Messages**: Status and error information
- 📦 **Containers**: Response wrappers and primary payloads
- 📚 **Inventories**: Complete data collections and catalogs

### Attack and Incident Analysis:
- ⚔️ **Attack Classification**: Threat types, attack categories
- 🔬 **Technical Analysis**: Detailed technical analysis, signatures
- 👥 **Impact Scope**: User impact, affected populations
- 🕵️ **Investigation**: Forensic analysis, investigation tracking
- 🔗 **Attribution**: Links, connections, attack attribution
- 📄 **Affected Resources**: Pages, elements, resources under attack

### DOM and Web Security:
- 🆔 **Element Identification**: DOM IDs, element targeting
- 🏷️ **HTML Elements**: Tag types, element manipulation
- ➕ **Injection/Addition**: Content injection, element insertion
- ➖ **Removal/Deletion**: Content removal, element deletion

### Color Coding (Text-Based):
- **RED (❌⚠️🚨)**: Warnings, errors, constraints, high-impact changes
- **GREEN (✅💡)**: Success, patterns, recommendations, guidance
- **BLUE (🔧📊🔍)**: Technical details, controls, analysis tools
- **YELLOW (🎯⚡)**: Decision points, priorities, performance metrics

### Time Emoji Standardization Benefits:

**Semantic Consistency**: Each emoji has a specific, logical purpose following natural metaphors:
- ⏰ **Alarm Clock** = Beginning/Initiation (when something starts)
- 🏁 **Checkered Flag** = Completion/Finish Line (when something definitively ends)
- 🕐 **Clock Face** = Current Time/Status (what's happening now)
- ⏱️ **Stopwatch** = Measurement/Performance (time calculations)

**AI Processing Benefits**:
- **Pattern Recognition**: Instant visual identification of time field types
- **Decision Logic**: Clear semantic meaning guides parameter selection
- **Context Awareness**: Understand time field purposes without semantic analysis
- **Consistency**: Eliminates confusion between similar time concepts

**Developer Benefits**:
- **Intuitive Understanding**: Visual metaphors match conceptual meaning
- **Quick Scanning**: Rapid identification of time field categories in documentation
- **Reduced Errors**: Clear semantic boundaries prevent misuse
- **Professional Documentation**: Consistent visual vocabulary across all schemas

### Usage Guidelines:

1. **Mandatory Compliance**: All new schema descriptions must use emojis from this reference
2. **Semantic Accuracy**: Choose emojis based on functional meaning, not visual appeal
3. **Consistency**: Use the same emoji for the same functional concept across all tools
4. **Single Emoji Rule**: Use one primary emoji per field description for clarity
5. **Update Process**: New emoji usage must be documented in this reference first

### Validation Checklist:
- [ ] All emojis used are from this authoritative reference
- [ ] Time-related fields follow the standardized 4-emoji system
- [ ] Functional categories match emoji semantic meaning
- [ ] No duplicate or inconsistent emoji usage
- [ ] New emojis added to reference before use

---

## Error Handling Guidelines

### Parameter Validation Errors
```typescript
// In descriptions, include validation guidance:
'⚠️ VALIDATION: Parameter must be X. Invalid values cause Y error. Use Z format for best results.'
```

### API Response Errors
```typescript
// Always include error interpretation in result fields:
result: z.boolean().describe(
    '✅ API SUCCESS: False values require checking message field for [specific error types] and potential parameter adjustment.',
),
```

### Empty Result Handling
```typescript
// Distinguish between different empty states:
content: z.array().describe(
    '📋 DATA ARRAY: Empty array indicates [no data vs filtered out vs time range issues]. Use length for quick assessment.',
),
```

### Time Range Validation
- **Document constraints**: API-enforced time limits
- **Error recovery**: How to adjust parameters when validation fails
- **Fallback strategies**: Alternative approaches when preferred ranges unavailable

---

## Performance Considerations

### Parameter Sizing Guidance
- **Start small**: Recommend initial small page sizes for exploration
- **Scale appropriately**: Guidance for production usage patterns
- **Maximum limits**: Document API constraints and error behaviors
- **Balance considerations**: Detail vs speed tradeoffs

### Filtering Impact Assessment
- **Multiplicative effects**: How combined filters reduce result scope
- **Performance optimization**: Which parameters are most selective
- **Caching implications**: How parameters affect response time
- **Resource consumption**: Memory and processing considerations

### Response Size Management
- **Pagination strategies**: When and how to implement
- **Field selection**: Guidance on requesting only needed data
- **Batch processing**: Optimal approaches for large datasets
- **Rate limiting**: API usage patterns and constraints

---

## Documentation Standards

### Code Examples
- **Always include** concrete JSON parameter examples
- **Show progressive** refinement from broad to specific
- **Demonstrate** error handling and recovery
- **Illustrate** optimal workflows with real scenarios

### Business Context
- **Connect** technical parameters to business outcomes
- **Explain** the "why" behind parameter combinations
- **Provide** decision-making frameworks
- **Include** success metrics and KPIs

### Maintenance Guidelines
- **Version compatibility**: How descriptions should evolve
- **Backward compatibility**: Maintaining existing guidance
- **Deprecation patterns**: How to handle removed features
- **Update frequency**: When to refresh examples and patterns

### Cross-Tool Relationships
- **Reference** related tools appropriately
- **Explain** workflow connections between tools
- **Provide** integration patterns and examples
- **Document** data flow and dependencies

---

## Validation Checklist

**MANDATORY VALIDATION** - Every MCP tool must pass this complete checklist before deployment.

### Tool Description Validation:
- [ ] **Quick Decision Guide** with 5-7 concrete scenarios using proper emojis (🎯)
- [ ] **Critical Rules** covering major constraints with warning emojis (❌⚠️)
- [ ] **High-Value Patterns** with JSON examples and success indicators (✅)
- [ ] **Technical Insights** with behavioral notes and proper categorization
- [ ] **Optimal Workflows** with multi-step processes using workflow emojis (🚀)

### Parameter Schema Validation:
- [ ] **Visual indicators** from Master Emoji Reference for all parameters
- [ ] **Impact level classification** (HIGH/MODERATE/LOW) with proper emojis
- [ ] **Use case guidance** with concrete scenarios and business context
- [ ] **Combination recommendations** documented with other parameters
- [ ] **Validation rules** and error conditions clearly specified
- [ ] **Time parameters** follow 4-emoji standardized system (⏰🏁🕐⏱️)

### Output Schema Validation:
- [ ] **All object schemas** use `.passthrough()` for API resilience
- [ ] **All fields** marked `.optional()` unless guaranteed by API
- [ ] **Field-by-field usage guidance** with proper emoji categorization
- [ ] **Business context** and interpretation provided
- [ ] **Decision thresholds** and key values documented
- [ ] **Cross-reference** capabilities explained
- [ ] **Pattern recognition** hints included

### Emoji Usage Validation:
- [ ] **All emojis** sourced from Master Emoji Reference
- [ ] **Time fields** use standardized emoji system consistently
- [ ] **Functional categories** match emoji semantic meaning
- [ ] **No duplicate** or inconsistent emoji usage within tool
- [ ] **Color coding** follows RED/GREEN/BLUE/YELLOW system

### Error Handling Validation:
- [ ] **Parameter validation** guidance included
- [ ] **API error interpretation** provided for result fields
- [ ] **Empty result** state explanations documented
- [ ] **Recovery strategies** and fallback approaches specified

### Performance Validation:
- [ ] **Parameter sizing** recommendations provided
- [ ] **Filtering impact** assessments documented
- [ ] **Resource consumption** guidance included
- [ ] **Optimization strategies** specified

### Documentation Validation:
- [ ] **Code examples** include concrete JSON parameter examples
- [ ] **Business context** connects technical parameters to outcomes
- [ ] **Cross-tool relationships** properly referenced
- [ ] **Maintenance guidelines** for future updates included

---

## Development Workflows

### New Tool Development Process:

1. **Requirements Analysis**:
   - Define business use cases and user needs
   - Identify API capabilities and constraints
   - Determine integration points with existing tools

2. **Schema Design**:
   - Design input parameters following Parameter Classification
   - Create output schemas with mandatory `.optional()` and `.passthrough()`
   - Apply Master Emoji Reference for all descriptions

3. **Tool Description Creation**:
   - Write Quick Decision Guide with 5-7 scenarios
   - Document Critical Rules and constraints
   - Provide High-Value Patterns with JSON examples
   - Create Optimal Workflows for multi-step processes

4. **Validation and Testing**:
   - Run complete Validation Checklist
   - Test with real API calls and edge cases
   - Validate emoji usage against Master Reference
   - Verify error handling and empty result scenarios

5. **Documentation Integration**:
   - Update cross-tool relationships
   - Add to relevant workflow documentation
   - Update Master Emoji Reference if new emojis needed

### Schema Enhancement Process:

1. **Field Analysis**:
   - Identify missing business context in field descriptions
   - Determine appropriate emoji from Master Reference
   - Assess impact level and usage patterns

2. **Description Enhancement**:
   - Follow field description template pattern
   - Include decision thresholds and key values
   - Provide cross-reference capabilities
   - Add pattern recognition hints

3. **Consistency Validation**:
   - Ensure emoji usage matches Master Reference
   - Verify time fields follow 4-emoji system
   - Check color coding compliance
   - Validate against existing tool patterns

### Emoji Reference Maintenance:

1. **New Emoji Evaluation**:
   - Assess functional need for new emoji
   - Determine semantic category and meaning
   - Verify no existing emoji serves the purpose
   - Document usage guidelines and examples

2. **Reference Updates**:
   - Add new emoji to appropriate category
   - Update usage guidelines if needed
   - Validate across all existing tools
   - Update color coding system if required

3. **Deprecation Process**:
   - Identify inconsistent or redundant emojis
   - Plan migration strategy for existing usage
   - Update Master Reference with deprecation notes
   - Implement changes across all affected tools

### Quality Assurance Workflow:

1. **Peer Review Process**:
   - Technical accuracy validation
   - Business context verification
   - Emoji usage compliance check
   - Documentation completeness review

2. **Testing Requirements**:
   - Real API integration testing
   - Error condition validation
   - Performance impact assessment
   - Cross-tool integration verification

3. **Deployment Checklist**:
   - Complete Validation Checklist passed
   - Master Emoji Reference compliance verified
   - Documentation integration completed
   - Cross-references updated

---

## Templates and Examples

### Complete Parameter Description Template:
```typescript
parameterName: z
    .type()
    .constraints()
    .describe(
        '🔧 PARAMETER TYPE: Brief functional description. ⚠️ IMPACT LEVEL: Specific behavioral notes and constraints. 💡 USE CASE: When to use with concrete scenarios. COMBINE WITH: Related parameters for enhanced analysis.',
    ),
```

### Time Parameter Examples:
```typescript
// Start time
startTime: z
    .string()
    .describe(
        '⏰ TIME RANGE START: ISO 8601 datetime string defining analysis period beginning. 🎯 FORMAT: "2024-01-15T10:00:00Z". ⚠️ CONSTRAINT: Must be within last 2 weeks (API enforced). 💡 STRATEGY: Use shorter windows (6-24 hours) for granular attack timelines, longer periods (1-3 days) for pattern analysis.',
    ),

// End time  
endTime: z
    .string()
    .describe(
        '🏁 TIME RANGE END: ISO 8601 datetime string defining analysis period conclusion. 🎯 FORMAT: "2024-01-15T16:00:00Z". ⚠️ CONSTRAINT: Must be after startTime and within API limits. 💡 STRATEGY: Use "now" for real-time monitoring, specific timestamps for historical incident analysis.',
    ),

// Current status time
lastSeen: z
    .string()
    .optional()
    .describe(
        '🕐 LATEST ACTIVITY: ISO 8601 timestamp of most recent observation. ✅ ACTIVE STATUS: Recent timestamps confirm ongoing activity. 📈 PERSISTENCE: Monitor for escalation patterns.',
    ),

// Measurement interval
timestamp: z
    .number()
    .optional()
    .describe(
        '⏱️ INTERVAL TIMESTAMP: Timestamp for the measurement interval (milliseconds since epoch). Essential for time-series visualization and trend analysis.',
    ),
```

### Output Field Description Template:
```typescript
fieldName: z
    .type()
    .optional()
    .describe(
        '📊 FIELD PURPOSE: What this field represents and contains. BUSINESS CONTEXT: Why it matters for decision-making. USE FOR: Specific analysis applications and workflows. THRESHOLDS: Decision points or significant values to monitor.',
    ),
```

### Schema-Level Description Template:
```typescript
.describe(
    '📦 SCHEMA PURPOSE: What this structure contains and represents. USAGE CONTEXT: When this data is most valuable for analysis. KEY PATTERNS: Important relationships between fields and decision frameworks.',
)
```

### Tool Description Template:
```
Tool brief description highlighting essential capabilities and primary use cases.

🎯 QUICK DECISION GUIDE:
├── Need X analysis? → Use parameter Y for focused results
├── Need broad overview? → Start with defaults, filter down progressively  
├── Need specific entity? → Use entityId parameter for targeted lookup
├── Need time-based trends? → Apply time filters with optimal window sizes
└── Need cross-reference? → Combine with related tools for comprehensive analysis

❌ CRITICAL RULES:
• Time range must be within last 2 weeks (API enforced)
• Empty arrays for filters cause validation errors
• Page size limit: 50 maximum (larger values cause errors)
• Required parameters: must provide at least one valid identifier

✅ HIGH-VALUE PATTERNS:

1. BROAD DISCOVERY:
   {startTime: "recent", endTime: "now", pageSize: 10}
   → Complete overview with manageable detail for initial assessment

2. FOCUSED ANALYSIS:
   {entityId: "specific-id", timeRange: "6_hours_ago"}
   → Deep dive into specific entity with recent activity focus

3. TREND ANALYSIS:
   {startTime: "24_hours_ago", endTime: "now", pageSize: 50}
   → Comprehensive trend data for pattern identification

⚠️ TECHNICAL INSIGHTS:
• Parameter combinations are multiplicative (filters stack to reduce scope)
• Large time windows provide context but slower performance
• Pagination enables systematic analysis of large datasets
• Empty results may indicate filtering too restrictive or no activity

🚀 OPTIMAL WORKFLOWS:

1. DISCOVERY WORKFLOW:
   - Start with broad parameters for landscape overview
   - Identify areas of interest from initial results
   - Refine with specific filters for targeted analysis
   - Cross-reference with related tools for comprehensive insights

2. INCIDENT RESPONSE WORKFLOW:
   - Use specific identifiers for immediate threat focus
   - Apply recent time windows for current activity assessment
   - Escalate based on severity indicators and business impact
   - Document findings for compliance and knowledge transfer

Response provides [specific data type] optimized for [primary use cases] with [key benefits for decision-making].
```

### Complete Schema Example:
```typescript
export const ExampleInputSchema = z.object({
    entityId: z
        .string()
        .min(1, 'entityId is required')
        .describe(
            '🆔 ENTITY IDENTIFIER: Unique identifier for targeted analysis. 🎯 REQUIRED: Must provide valid entity ID. 💡 USE CASES: Incident response, detailed investigation, compliance auditing. 📊 RETURNS: Complete entity profile with security status and activity timeline.',
        ),
    startTime: z
        .string()
        .describe(
            '⏰ TIME RANGE START: ISO 8601 datetime string defining analysis period beginning. 🎯 FORMAT: "2024-01-15T10:00:00Z". ⚠️ CONSTRAINT: Must be within API limits. 💡 STRATEGY: Use shorter windows for real-time monitoring, longer periods for trend analysis.',
        ),
    pageSize: z
        .number()
        .int()
        .min(1)
        .max(50)
        .optional()
        .default(10)
        .describe(
            '📊 RESULT SIZE CONTROL: Maximum records to return per request. ⚠️ LIMIT: Maximum 50 (larger values cause errors). 💡 STRATEGY: Start small (5-10) for exploration, use larger (20-50) for comprehensive analysis.',
        ),
});

export const ExampleOutputSchema = z
    .object({
        result: z
            .boolean()
            .optional()
            .describe(
                '✅ API SUCCESS: Indicates successful operation completion. False values require checking message field for error details and potential parameter adjustment.',
            ),
        message: z
            .string()
            .optional()
            .describe(
                '💬 STATUS MESSAGE: Human-readable response status. Critical for error handling, debugging parameter issues, and understanding API constraints.',
            ),
        content: z
            .object({
                entityData: z
                    .string()
                    .optional()
                    .describe(
                        '📊 ENTITY INFORMATION: Core entity data and metadata. Essential for business analysis and decision-making workflows.',
                    ),
                metrics: z
                    .number()
                    .optional()
                    .describe(
                        '📈 PERFORMANCE METRICS: Quantitative measurements for assessment. Use for trend analysis and threshold-based alerting.',
                    ),
            })
            .passthrough()
            .optional()
            .describe(
                '📦 MAIN PAYLOAD: Primary data when result=true. Contains comprehensive entity analysis and metrics. Null when API errors occur.',
            ),
    })
    .passthrough()
    .describe(
        '📦 API RESPONSE: Complete response wrapper with success indicators and structured data payload. Check result field first, then parse content for business analysis.',
    );
```

---

**Following these best practices ensures MCP tools are optimized for AI agent usage with clear decision logic, comprehensive parameter guidance, and actionable output interpretation. This document serves as the authoritative reference for all MCP tool development.** 