# static-app-shell Specification

## Requirements

### Requirement: Static Vite SPA

MUST be Vite+TS SPA, `base: './'`, `dist/` on static host; `file://` MUST NOT be supported.

#### Scenario: Static host

- GIVEN production `dist/`
- WHEN served via static host or preview
- THEN SPA MUST load; `file://` unsupported

### Requirement: Maps API Key

Maps key MUST come from env/build; MUST NOT commit a live secret.

#### Scenario: Missing key error

- GIVEN no Maps API key
- WHEN app starts
- THEN explicit error MUST show

### Requirement: Empty Invalid States

Missing/empty/invalid data MUST show explicit empty/error, not blank.

#### Scenario: Invalid dataset

- GIVEN invalid schema or sampling
- WHEN load attempted
- THEN explicit error MUST show

#### Scenario: Zero sites

- GIVEN valid JSON with zero usable sites
- WHEN app loads
- THEN explicit empty state MUST show

### Requirement: Provisional Shell Notice

Shell MUST show provisional notice (MAY share map label).

#### Scenario: Notice visible

- GIVEN provisional dataset loaded
- WHEN primary UI visible
- THEN provisional status MUST be visible
