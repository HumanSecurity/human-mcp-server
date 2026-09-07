

[![npm version](https://badge.fury.io/js/%40humansecurity%2Fhuman-mcp-server.svg)](https://www.npmjs.com/package/@humansecurity/human-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

![HUMAN Security Logo](https://raw.githubusercontent.com/HumanSecurity/human-mcp-server/main/.images/logo.png)

This is the official MCP Server for [HUMAN Security](https://www.humansecurity.com/).

# HUMAN Security MCP Server

Supercharge your AI workflows with comprehensive cybersecurity intelligence from HUMAN Security. This Model Context Protocol (MCP) server provides access to HUMAN's industry-leading threat detection, attack analysis, and security monitoring capabilities directly within your AI-powered applications.

![](https://raw.githubusercontent.com/HumanSecurity/human-mcp-server/main/.images/mcp.gif)

## 🛡️ What You Can Do

**Cyberfraud Protection & Analytics**
- **Traffic Analysis**: Monitor web and mobile traffic patterns with comprehensive security metrics
- **Real-time Attack Monitoring**: Track sophisticated attack campaigns with time-series analytics and threat intelligence
- **Attack Investigation**: Deep-dive into specific attack clusters with detailed forensics and attribution
- **Account Security**: Investigate suspicious account behavior, fraud patterns, and security incidents
- **Custom Security Rules**: Manage and audit your custom mitigation policies and security controls

**Code Defender - Client-Side Security**
- **Client-Side Supply Chain Protection**: Monitor first- and third-party scripts and vendors on your payment and sensitive pages
- **PCI DSS Compliance**: Streamline PCI DSS compliance and confirm that your site is not susceptible to attacks from scripts
- **Security Incident Monitoring**: Track client-side attacks, e-skimming attempts, and code injection threats
- **HTTP Security-Impacting Headers**: Monitor and alert personnel to changes to security-impacting HTTP headers

## 🔑 Prerequisites

* If running with NPM, download and install [Node.js](https://nodejs.org/en/download).
* If running with Docker, download and install [Docker](https://www.docker.com/get-started/).

## 🚀 Quick Start

Add this configuration to your MCP server file:

```json
{
  "mcpServers": {
    "human-security": {
      "command": "npx",
      "args": ["-y", "@humansecurity/human-mcp-server"],
      "env": {
        "HUMAN_CYBERFRAUD_API_TOKEN": "your-cyberfraud-token",
        "HUMAN_CODE_DEFENDER_API_TOKEN": "your-code-defender-token"
      }
    }
  }
}
```

* For Claude Desktop, navigate to **Claude > Settings > Developer > Edit Config**. This will take you to the location of the `claude_desktop_config.json` file. Edit this file in your preferred editor.
* For Cursor, navigate to **Cursor > Settings > Cursor Settings > Tools & Integrations**. The MCP Tools section will take you to the `mcp.json` file, which you can edit directly in the Cursor editor.

You'll need API tokens from your HUMAN Security account to access the services. The server automatically detects which services you have access to and enables the corresponding tools.

### Required Tokens
- **`HUMAN_CYBERFRAUD_API_TOKEN`**: Enables attack monitoring, traffic analysis, account investigation, and custom rules management
- **`HUMAN_CODE_DEFENDER_API_TOKEN`**: Enables supply chain monitoring, PCI compliance, and client-side security analysis

## 🐳 Run with Docker

If you prefer to use Docker over NPM, run the MCP server container directly:

```bash
docker run --rm -i \
  -e HUMAN_CYBERFRAUD_API_TOKEN=<value> \
  -e HUMAN_CODE_DEFENDER_API_TOKEN=<value> \
  us-docker.pkg.dev/hmn-registry-public/containers/human-mcp-server:latest
```

To use Docker from your MCP client config (e.g., Cursor or Claude Desktop), replace the NPM command with a Docker invocation:

```json
{
  "mcpServers": {
    "human-security": {
      "command": "docker",
      "args": [
        "run", "--rm", "-i",
        "-e", "HUMAN_CYBERFRAUD_API_TOKEN",
        "-e", "HUMAN_CODE_DEFENDER_API_TOKEN",
        "us-docker.pkg.dev/hmn-registry-public/containers/human-mcp-server:latest"
      ],
      "env": {
        "HUMAN_CYBERFRAUD_API_TOKEN": "your-cyberfraud-token",
        "HUMAN_CODE_DEFENDER_API_TOKEN": "your-code-defender-token"
      }
    }
  }
}
```

### Optional Configuration
- **`HUMAN_API_HOST`**: Use a different API endpoint (default: `api.humansecurity.com`)
- **`HUMAN_API_VERSION`**: Specify API version (default: `v1`)
- **`HTTP_TIMEOUT_MS`**: Request timeout in milliseconds (default: `30000`)
- **`HUMAN_TRAFFIC_API_BASE`**: Override the base URL for traffic data endpoints. Useful for local development against a pxPortal instance (e.g. `http://localhost:3000/api/v1/botDefender/traffic`). When not set, defaults to the standard HUMAN API base.

## 💡 Usage Examples

**Ask your AI assistant questions like:**

* *"Show me attack trends over the last 24 hours"*
* *"Investigate suspicious activity for account ID XXXXX"*
* *"What third-party scripts are running on our payment pages?"*
* *"Show me the scripts and headers in my PCI inventory"*
* *"Analyze the effectiveness of our custom security rules"*
* *"Show me details about attack cluster XXXXX"*

## 📊 Available Tools

### Cyberfraud Protection
- **Traffic Data**: Comprehensive traffic analytics with overtime time-series, aggregated metrics, and ranked tops breakdowns
- **Attack Reporting (Overtime)**: Time-series attack analytics and trend analysis
- **Attack Reporting (Overview)**: Detailed attack cluster intelligence and forensics
- **Account Information**: Individual account security analysis and incident tracking
- **Custom Rules**: Security policy management and effectiveness analysis

#### Detailed Cyberfraud tools

| Tool | Purpose | Key inputs |
| --- | --- | --- |
| `human_get_attack_reporting_overtime` | Analyze attack activity over time using five-minute intervals. Useful for timelines, trends, volume changes, cluster persistence, and SOC monitoring. | `startTime`, `endTime`; optional `threatTypes`, `trafficSources`, `trafficTypes` |
| `human_get_attack_reporting_overview` | Discover and investigate attack clusters, including attribution, attack paths, threat indicators, sophistication, and targeted domains. | Optional time and threat filters; `clusterId`; `page`, `pageSize` (maximum 50) |
| `human_get_traffic_data` | Analyze traffic metrics, trends, and ranked top values. Supports combined metrics, overtime, and tops views. | `startTime`, `endTime`; at least one of `metrics`, `overtime`, or `tops` |
| `human_get_raw_activities` | Retrieve individual request-level records for forensic investigation by IP, block reference, email, domain, path, VID, or other fields. | Required non-empty `searchQuery`; time window of at most four hours; optional `limit`, `offset` |
| `human_get_custom_rules` | Retrieve the complete custom security rule inventory, including priorities, conditions, actions, status, descriptions, and identifiers. | No inputs |

### Recommended workflow

1. Start with `human_get_attack_reporting_overview` to discover active attack clusters.
2. Use `human_get_attack_reporting_overtime` to understand when an attack started, peaked, and declined.
3. Use `human_get_traffic_data` for totals, trends, and top paths or incident types.
4. Use `human_get_raw_activities` to investigate a specific IP, block reference, domain, email, or request.
5. Use `human_get_custom_rules` to understand the mitigation policies affecting traffic.

Example `human_get_raw_activities` query:

```json
{
  "searchQuery": [
    { "type": "field", "key": "displayScore", "operator": ">=", "value": 80 }
  ],
  "startTime": "2025-06-23T10:00:00Z",
  "endTime": "2025-06-23T11:00:00Z"
}
```

### Important constraints

- Attack reporting and traffic-analysis time ranges must be within the last two weeks.
- Raw activity queries must cover no more than four hours.
- Do not send empty arrays such as `"searchQuery": []`; omit optional arrays or provide at least one valid item.
- Filters can legitimately return zero results; this does not necessarily indicate an error.

### Code Defender Security
- **Security Incidents**: Client-side attack detection and investigation
- **Script Inventory**: First- and third-party script monitoring and PCI compliance
- **Header Inventory**: HTTP security header analysis and optimization

## 🔗 Integration Options

### Single Service Setup
If you only need one service, you can configure just that token:

**Cyberfraud Only:**
```json
{
  "human-security": {
    "command": "npx",
    "args": ["-y", "@humansecurity/human-mcp-server"],
    "env": {
      "HUMAN_CYBERFRAUD_API_TOKEN": "your-token-here"
    }
  }
}
```

**Code Defender Only:**
```json
{
  "human-security": {
    "command": "npx",
    "args": ["-y", "@humansecurity/human-mcp-server"],
    "env": {
      "HUMAN_CODE_DEFENDER_API_TOKEN": "your-token-here"
    }
  }
}
```

## 🧪 Local Development & Testing

### Running against a local pxPortal instance

To test the MCP server against a locally running pxPortal (default port `3000`), set `HUMAN_TRAFFIC_API_BASE` to override the traffic data endpoint:

```json
{
  "mcpServers": {
    "human-security": {
      "command": "node",
      "args": ["/path/to/human-mcp-server/dist/index.cjs"],
      "env": {
        "HUMAN_CYBERFRAUD_API_TOKEN": "your-token",
        "HUMAN_TRAFFIC_API_BASE": "http://localhost:3000/api/v1/botDefender/traffic"
      }
    }
  }
}
```

### End-to-end test script

`scripts/test_local.mjs` spawns the MCP server and runs 25 scenarios against a live backend, covering all modes (`overtime`, `metrics`, `tops`), filters, combined calls, time ranges, and tops field coverage.

```bash
# Build first
npm run build

# Run all scenarios against localhost:3000
HUMAN_CYBERFRAUD_API_TOKEN=<token> node scripts/test_local.mjs

# Run against a custom backend
HUMAN_CYBERFRAUD_API_TOKEN=<token> \
HUMAN_TRAFFIC_API_BASE=http://my-host/api/v1/botDefender/traffic \
node scripts/test_local.mjs
```

Expected output: `RESULTS: 25 passed, 0 failed`.

## 🆘 Support

- **Documentation**: [HUMAN Security Documentation](https://docs.humansecurity.com)
- **API Tokens**:
  - [Cyberfraud](https://docs.humansecurity.com/applications/reference/authentication#getting-a-token-for-the-account-defender-adaptive-feedback-bot-defender-or-credential-intelligence-api)
  - [Code Defender](https://docs.humansecurity.com/applications/reference/authentication#getting-a-token-for-the-code-defender-or-pci-dss-api)
- **Technical Support**: Available through your HUMAN Security support channels

## 📄 License
MIT
