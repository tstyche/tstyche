# Releases

## [4.0.0-beta.9] - 2025-05-08

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

## Added

- Bring back support for TypeScript >=4.7 ([#476](https://github.com/tstyche/tstyche/pull/476))
- Add validation for `when()` target ([#480](https://github.com/tstyche/tstyche/pull/480))

### Fixed

- Handle trailing commas in the ability layer text ([#479](https://github.com/tstyche/tstyche/pull/479))

### Changed

- Move test tree validation logic to the `Collect` class ([#471](https://github.com/tstyche/tstyche/pull/471))

## [4.0.0-beta.8] - 2025-05-05

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

## Added

- Add validation for template test files ([#470](https://github.com/tstyche/tstyche/pull/470))

### Fixed

- Do not typecheck already seen test files ([#475](https://github.com/tstyche/tstyche/pull/475))
- Always use default compiler options when file is not included ([#473](https://github.com/tstyche/tstyche/pull/473))
- Normalize template test file specifier ([#469](https://github.com/tstyche/tstyche/pull/469))

## [4.0.0-beta.7] - 2025-05-04

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

### Added

- **New!** Add template test file support ([#468](https://github.com/tstyche/tstyche/pull/468))
- **New!** Add the `when()` utility and the `.isCalledWith()` action ([#460](https://github.com/tstyche/tstyche/pull/460), [#466](https://github.com/tstyche/tstyche/pull/466))

### Changed

- **Breaking!** Remove config details from summary and `Result` ([#459](https://github.com/tstyche/tstyche/pull/459))

## [4.0.0-beta.6] - 2025-04-15

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

### Fixed

- Allow passing property access expressions to the `.toBeCallableWith()` and `.toBeConstructableWith()` matchers (#457)

## [4.0.0-beta.5] - 2025-04-15

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

### Fixed

- Insert missing semicolons in the ability layer text ([#456](https://github.com/tstyche/tstyche/pull/456))

## [4.0.0-beta.4] - 2025-04-14

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

### Added

- **New!** Add the `.toBeConstructableWith()` matcher ([#451](https://github.com/tstyche/tstyche/pull/451))

### Fixed

- Improve validation of the source node passed to `.toBeCallableWith()` ([#449](https://github.com/tstyche/tstyche/pull/449), [#453](https://github.com/tstyche/tstyche/pull/453))

## [4.0.0-beta.3] - 2025-04-11

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

### Fixed

- Relax validation of the target of `.toBeCallableWith()` matcher ([#448](https://github.com/tstyche/tstyche/pull/448))

## [4.0.0-beta.2] - 2025-04-11

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

### Added

- **New!** Add the `.toBeCallableWith()` matcher ([#447](https://github.com/tstyche/tstyche/pull/447))

### Fixed

- Do not reverse diagnostics of the ability layer ([#446](https://github.com/tstyche/tstyche/pull/446))

### Changed

- Always take `compiler` as the first constructor argument ([#445](https://github.com/tstyche/tstyche/pull/445))

## [4.0.0-beta.1] - 2025-04-06

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

### Added

- **New!** Add the `.toBeApplicable` matcher ([#100](https://github.com/tstyche/tstyche/pull/100))

## [4.0.0-beta.0] - 2025-03-30

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-4) page._

### Added

- Add `collect:*` events ([#411](https://github.com/tstyche/tstyche/pull/411))

### Changed

- **Breaking!** Remove primitive type matchers ([#442](https://github.com/tstyche/tstyche/pull/442))
- **Breaking!** Exclude whitespace when comparing diagnostic messages ([#427](https://github.com/tstyche/tstyche/pull/427))
- **Breaking!** Make add the `minorVersions` property to store manifest ([#425](https://github.com/tstyche/tstyche/pull/425))
- **Breaking!** Make default compiler options strict ([#424](https://github.com/tstyche/tstyche/pull/424))
- **Breaking!** Drop support for TypeScript `4.x` ([#423](https://github.com/tstyche/tstyche/pull/423))
- **Breaking!** Enable the `rejectAnyType` and `rejectNeverType` options by default ([#422](https://github.com/tstyche/tstyche/pull/422))
- **Breaking!** Enable the `checkSourceFiles` option by default ([#421](https://github.com/tstyche/tstyche/pull/421))
- **Breaking!** Require passing `resolvedConfig` to `ExpectService` constructor ([#420](https://github.com/tstyche/tstyche/pull/420))
- **Breaking!** Rename `AssertionNode` and `TestTreeNode` classes ([#419](https://github.com/tstyche/tstyche/pull/419))
- **Breaking!** Drop support for Node.js 18 ([#418](https://github.com/tstyche/tstyche/pull/418))
- **Breaking!** Rename the `--fetch` command line option ([#417](https://github.com/tstyche/tstyche/pull/417))
- **Breaking!** Remove the `.toMatch()` matcher ([#416](https://github.com/tstyche/tstyche/pull/416))
- **Breaking!** Remove `Store.getSupportedTags()` method ([#415](https://github.com/tstyche/tstyche/pull/415))
- **Breaking!** Remove `Version.isVersionTag()` method ([#414](https://github.com/tstyche/tstyche/pull/414))

## [3.5.0] - 2025-01-14

### Added

- Make code frame output configurable ([#407](https://github.com/tstyche/tstyche/pull/407), [#408](https://github.com/tstyche/tstyche/pull/408))

## [3.4.0] - 2025-01-11

### Fixed

- Simplify complex unions and intersections for `.toBe()` checks ([#394](https://github.com/tstyche/tstyche/pull/394))

### Changed

- Respect non-interactive environments in watch mode ([#405](https://github.com/tstyche/tstyche/pull/405))

## [3.3.1] - 2024-12-31

### Fixed

- Treat intersections or unions of identical types as identical to its constituent type (target types) ([#393](https://github.com/tstyche/tstyche/pull/393))

## [3.3.0] - 2024-12-30

### Fixed

- Print error codes at the end of the first line of diagnostics ([#391](https://github.com/tstyche/tstyche/pull/391))

### Changed

- Treat intersections or unions of identical types as identical to its constituent type (source types) ([#392](https://github.com/tstyche/tstyche/pull/392))

## [3.2.0] - 2024-12-23

### Fixed

- Emit the `project:uses` event only once per project ([#386](https://github.com/tstyche/tstyche/pull/386))

### Added

- **New!** Add the `checkSourceFiles` option ([#388](https://github.com/tstyche/tstyche/pull/388), [#390](https://github.com/tstyche/tstyche/pull/390))
- Expose the `SelectHookContext` type ([#387](https://github.com/tstyche/tstyche/pull/387))

## [3.1.1] - 2024-12-05

### Fixed

- Allow specifying unsupported versions in `target` ranges ([#383](https://github.com/tstyche/tstyche/pull/383))

## [3.1.0] - 2024-12-03

### Changed

- Deprecate the `Version.isVersionTag()` method ([#379](https://github.com/tstyche/tstyche/pull/379))
- Deprecate the `Store.getSupportedTags()` method ([#377](https://github.com/tstyche/tstyche/pull/377))

### Added

- **New!** Support testing against TypeScript version ranges ([#377](https://github.com/tstyche/tstyche/pull/377))
- **New!** Add the `rejectAnyType` and `rejectNeverType` configuration options ([#370](https://github.com/tstyche/tstyche/pull/370), [#373](https://github.com/tstyche/tstyche/pull/373))
- Add the `--list` command line option ([#364](https://github.com/tstyche/tstyche/pull/364), [#366](https://github.com/tstyche/tstyche/pull/366))

## [3.0.0] - 2024-11-05

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Fixed

- Take into account `exactOptionalPropertyTypes` option when comparing types ([#357](https://github.com/tstyche/tstyche/pull/357))
- Always resolve test file paths ([#346](https://github.com/tstyche/tstyche/pull/346))
- Mark not existing test file as failed ([#341](https://github.com/tstyche/tstyche/pull/341))
- Fix relative path normalization logic ([#317](https://github.com/tstyche/tstyche/pull/317))
- When requested, always suppress fetch errors ([#275](https://github.com/tstyche/tstyche/pull/275))

### Changed

- **Breaking!** Rename the `TSTYCHE_TYPESCRIPT_MODULE` environment variable ([#356](https://github.com/tstyche/tstyche/pull/356))
- **Breaking!** Use `import.meta.resolve()` ([#355](https://github.com/tstyche/tstyche/pull/355))
- **Breaking!** Rename `TargetResult.target` property ([#339](https://github.com/tstyche/tstyche/pull/339))
- **Breaking!** Rename the `Options` class ([#334](https://github.com/tstyche/tstyche/pull/334))
- **Breaking!** Make the `Config` class not instantiable ([#332](https://github.com/tstyche/tstyche/pull/332))
- **Breaking!** Make the `Select` class not instantiable ([#331](https://github.com/tstyche/tstyche/pull/331))
- **Breaking!** Remove the `TSTyche` class ([#330](https://github.com/tstyche/tstyche/pull/330))
- **Breaking!** Make the `Store` class not instantiable ([#329](https://github.com/tstyche/tstyche/pull/329))
- **Breaking!** Make the `OutputService` class not instantiable ([#328](https://github.com/tstyche/tstyche/pull/328))
- **Breaking!** Rename the `ListReporter` class ([#326](https://github.com/tstyche/tstyche/pull/326))
- **Breaking!** Rename the `EventHandler.on()` method ([#323](https://github.com/tstyche/tstyche/pull/323))
- **Breaking!** Deprecate the `.toMatch()` matcher ([#315](https://github.com/tstyche/tstyche/pull/315))
- **Breaking!** Remove `ConfigService` constructor arguments ([#297](https://github.com/tstyche/tstyche/pull/297))
- **Breaking!** Rename `Task`, `TaskResult`, `Runner` classes and `task:*` events ([#296](https://github.com/tstyche/tstyche/pull/296))
- **Breaking!** Remove `InputService` constructor options ([#294](https://github.com/tstyche/tstyche/pull/294))
- **Breaking!** Remove `OutputService` constructor options ([#293](https://github.com/tstyche/tstyche/pull/293))
- **Breaking!** Rename the `project:uses` event ([#290](https://github.com/tstyche/tstyche/pull/290))
- **Breaking!** Rename the `store:adds` event ([#289](https://github.com/tstyche/tstyche/pull/289))
- **Breaking!** Remove the deprecated `.toBeAssignable()` and `.toEqual()` matchers ([#286](https://github.com/tstyche/tstyche/pull/286))
- **Breaking!** Drop support for Node.js 16 ([#285](https://github.com/tstyche/tstyche/pull/285))
- **Breaking!** Directly fetch and extract tarballs of `typescript` packages ([#269](https://github.com/tstyche/tstyche/pull/269), [#291](https://github.com/tstyche/tstyche/pull/291))

### Added

- Add index signature checks for the `.toHaveProperty()` matcher ([#362](https://github.com/tstyche/tstyche/pull/362))
- Allow `.toRaiseError()` to take regular expressions ([#358](https://github.com/tstyche/tstyche/pull/358))
- **New!** Add the `tsconfig` configuration option ([#343](https://github.com/tstyche/tstyche/pull/343))
- **New!** Add support for custom reporters ([#327](https://github.com/tstyche/tstyche/pull/327))
- **New!** Add support for plugins ([#322](https://github.com/tstyche/tstyche/pull/322), [#324](https://github.com/tstyche/tstyche/pull/324), [#337](https://github.com/tstyche/tstyche/pull/337), [#349](https://github.com/tstyche/tstyche/pull/349), [#350](https://github.com/tstyche/tstyche/pull/350), [#352](https://github.com/tstyche/tstyche/pull/352))
- **New!** Add `omit()` and `pick()` utilities ([#314](https://github.com/tstyche/tstyche/pull/314))
- Add the `JsonScanner` class ([#310](https://github.com/tstyche/tstyche/pull/310))
- Add `prune()` method to `StoreService` class ([#298](https://github.com/tstyche/tstyche/pull/298))
- Add the `LockService` class ([#281](https://github.com/tstyche/tstyche/pull/281))
- Add the `Fetcher` class ([#274](https://github.com/tstyche/tstyche/pull/274))
- **New!** Add the `TSTYCHE_NPM_REGISTRY` environment variable ([#266](https://github.com/tstyche/tstyche/pull/266), [#282](https://github.com/tstyche/tstyche/pull/282))

## [3.0.0-rc.2] - 2024-11-02

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Added

- Add index signature checks for the `.toHaveProperty()` matcher ([#362](https://github.com/tstyche/tstyche/pull/362))

## [3.0.0-rc.1] - 2024-10-31

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Fixed

- Take into account `exactOptionalPropertyTypes` option when comparing types ([#357](https://github.com/tstyche/tstyche/pull/357))

### Added

- Allow `.toRaiseError()` to take regular expressions ([#358](https://github.com/tstyche/tstyche/pull/358))

## [3.0.0-rc.0] - 2024-10-30

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Changed

- **Breaking!** Rename the `TSTYCHE_TYPESCRIPT_MODULE` environment variable ([#356](https://github.com/tstyche/tstyche/pull/356))
- **Breaking!** Use `import.meta.resolve()` ([#355](https://github.com/tstyche/tstyche/pull/355))

## [3.0.0-beta.6] - 2024-10-27

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Fixed

- Always resolve test file paths ([#346](https://github.com/tstyche/tstyche/pull/346))

### Changed

- Require plugins to have `name` property ([#349](https://github.com/tstyche/tstyche/pull/349), [#352](https://github.com/tstyche/tstyche/pull/352))

### Added

- Pass context to the `select` hook ([#350](https://github.com/tstyche/tstyche/pull/350))

## [3.0.0-beta.5] - 2024-10-23

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Fixed

- Mark not existing test file as failed ([#341](https://github.com/tstyche/tstyche/pull/341))

### Changed

- Rename `TargetResult.target` property ([#339](https://github.com/tstyche/tstyche/pull/339))

### Added

- **New!** Add the `tsconfig` configuration option ([#343](https://github.com/tstyche/tstyche/pull/343))

## [3.0.0-beta.4] - 2024-10-17

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Fixed

- Remove environment options to `ResolvedConfig` (reverts [#299](https://github.com/tstyche/tstyche/pull/299)) ([#336](https://github.com/tstyche/tstyche/pull/334))

### Changed

- **Breaking!** Rename the `Options` class ([#334](https://github.com/tstyche/tstyche/pull/334))
- **Breaking!** Make the `Config` class not instantiable ([#332](https://github.com/tstyche/tstyche/pull/332))
- **Breaking!** Make the `Select` class not instantiable ([#331](https://github.com/tstyche/tstyche/pull/331))
- **Breaking!** Remove the `TSTyche` class ([#330](https://github.com/tstyche/tstyche/pull/330))
- **Breaking!** Make the `Store` class not instantiable ([#329](https://github.com/tstyche/tstyche/pull/329))
- **Breaking!** Make the `OutputService` class not instantiable ([#328](https://github.com/tstyche/tstyche/pull/328))
- **Breaking!** Rename the `ListReporter` class ([#326](https://github.com/tstyche/tstyche/pull/326))
- **Breaking!** Rename the `EventHandler.on()` method ([#323](https://github.com/tstyche/tstyche/pull/323))

### Added

- **New!** Add support for custom reporters ([#327](https://github.com/tstyche/tstyche/pull/327))
- **New!** Add support for plugins ([#322](https://github.com/tstyche/tstyche/pull/322), [#324](https://github.com/tstyche/tstyche/pull/324), [#337](https://github.com/tstyche/tstyche/pull/337))

## [3.0.0-beta.3] - 2024-10-07

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Fixed

- Fix relative path normalization logic ([#317](https://github.com/tstyche/tstyche/pull/317))

### Changed

- **Breaking!** Deprecate the `.toMatch()` matcher ([#315](https://github.com/tstyche/tstyche/pull/315))

### Added

- **New!** Add `omit()` and `pick()` utilities ([#314](https://github.com/tstyche/tstyche/pull/314))

## [3.0.0-beta.2] - 2024-10-05

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Added

- Add the `JsonScanner` class ([#310](https://github.com/tstyche/tstyche/pull/310))

## [3.0.0-beta.1] - 2024-08-25

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Fixed

- Write `typescript` packages atomically ([#291](https://github.com/tstyche/tstyche/pull/291))

### Changed

- **Breaking!** Remove `ConfigService` constructor arguments ([#297](https://github.com/tstyche/tstyche/pull/297))
- **Breaking!** Rename `Task`, `TaskResult`, `Runner` classes and `task:*` events ([#296](https://github.com/tstyche/tstyche/pull/296))
- **Breaking!** Remove `InputService` constructor options ([#294](https://github.com/tstyche/tstyche/pull/294))
- **Breaking!** Remove `OutputService` constructor options ([#293](https://github.com/tstyche/tstyche/pull/293))
- **Breaking!** Rename the `project:uses` event ([#290](https://github.com/tstyche/tstyche/pull/290))
- **Breaking!** Rename the `store:adds` event ([#289](https://github.com/tstyche/tstyche/pull/289))

### Added

- Add environment options to `ResolvedConfig` ([#299](https://github.com/tstyche/tstyche/pull/299))
- Add `prune()` method to `StoreService` class ([#298](https://github.com/tstyche/tstyche/pull/298))

## [3.0.0-beta.0] - 2024-08-12

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-3) page._

### Fixed

- When requested, always suppress fetch errors ([#275](https://github.com/tstyche/tstyche/pull/275))

### Changed

- **Breaking!** Remove the deprecated `.toBeAssignable()` and `.toEqual()` matchers ([#286](https://github.com/tstyche/tstyche/pull/286))
- **Breaking!** Drop support for Node.js 16 ([#285](https://github.com/tstyche/tstyche/pull/285))
- **Breaking!** Directly fetch and extract tarballs of `typescript` packages ([#269](https://github.com/tstyche/tstyche/pull/269))

### Added

- Add the `LockService` class ([#281](https://github.com/tstyche/tstyche/pull/281))
- Add the `Fetcher` class ([#274](https://github.com/tstyche/tstyche/pull/274))
- **New!** Add the `TSTYCHE_NPM_REGISTRY` environment variable ([#266](https://github.com/tstyche/tstyche/pull/266), [#282](https://github.com/tstyche/tstyche/pull/282))

## [2.1.1] - 2024-07-27

### Fixed

- Mark warning locations in yellow ([#262](https://github.com/tstyche/tstyche/pull/262))
- Support `.toAcceptProps()` on TypeScript 4.5 and below ([#261](https://github.com/tstyche/tstyche/pull/261))

## [2.1.0] - 2024-07-15

### Fixed

- Allow empty config file ([#239](https://github.com/tstyche/tstyche/pull/239))
- Handle not supported matchers ([#227](https://github.com/tstyche/tstyche/pull/227))

### Changed

- Show related diagnostics, when provided by TypeScript ([#242](https://github.com/tstyche/tstyche/pull/242))
- Mark the entire locations in diagnostic messages ([#238](https://github.com/tstyche/tstyche/pull/238), [#247](https://github.com/tstyche/tstyche/pull/247), [#251](https://github.com/tstyche/tstyche/pull/251), [#253](https://github.com/tstyche/tstyche/pull/253), [#255](https://github.com/tstyche/tstyche/pull/255))
- In watch mode, return the list of test files as an async iterable ([#233](https://github.com/tstyche/tstyche/pull/233), [#232](https://github.com/tstyche/tstyche/pull/232))

### Added

- **New!** Add the `.toAcceptProps()` matcher ([#237](https://github.com/tstyche/tstyche/pull/237))

## [2.0.0] - 2024-06-10

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-2) page._

### Fixed

- Always allow passing `cancellationToken` as an argument ([#206](https://github.com/tstyche/tstyche/pull/206))
- **Breaking!** Always set the `configFilePath` property in the resolved config ([#203](https://github.com/tstyche/tstyche/pull/203))
- **Breaking!** Do not return the `Result` from test runner ([#188](https://github.com/tstyche/tstyche/pull/188))
- Collect and handle nested `expect()` assertions ([#156](https://github.com/tstyche/tstyche/pull/156))

### Changed

- **Breaking!** Use `fetch()` global ([#214](https://github.com/tstyche/tstyche/pull/214))
- **Breaking!** Use the `jsx-runtime` transform for output components ([#199](https://github.com/tstyche/tstyche/pull/199), [#219](https://github.com/tstyche/tstyche/pull/219))
- **Breaking!** Drop support for Node.js 14 ([#198](https://github.com/tstyche/tstyche/pull/198))
- **Breaking!** Deprecate `.toEqual()` in favour of `.toBe()` ([#151](https://github.com/tstyche/tstyche/pull/151))
- **Breaking!** Deprecate `.toBeAssignable()` in favour of `.toBeAssignableWith()` ([#142](https://github.com/tstyche/tstyche/pull/142))

### Added

- Add the `DiagnosticOrigin` class ([#216](https://github.com/tstyche/tstyche/pull/216))
- Add the `TestFile` class ([#189](https://github.com/tstyche/tstyche/pull/189))
- **New!** Add the watch mode ([#170](https://github.com/tstyche/tstyche/pull/170), [#173](https://github.com/tstyche/tstyche/pull/173), [#204](https://github.com/tstyche/tstyche/pull/204), [#208](https://github.com/tstyche/tstyche/pull/208), [#213](https://github.com/tstyche/tstyche/pull/213), [#218](https://github.com/tstyche/tstyche/pull/218))
- Add the `SelectService` class ([#165](https://github.com/tstyche/tstyche/pull/165))
- **New!** Add `.toBe()` matcher ([#151](https://github.com/tstyche/tstyche/pull/151))
- **New!** Add `.toBeAssignableTo()` and `.toBeAssignableWith()` matchers ([#141](https://github.com/tstyche/tstyche/pull/141))

## [2.0.0-rc.2] - 2024-06-08

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-2) page._

### Added

- Exit the watch mode when `q` is pressed ([#218](https://github.com/tstyche/tstyche/pull/218))

## [2.0.0-rc.1] - 2024-06-04

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-2) page._

### Fixed

- Show deprecation warnings for each test file ([#217](https://github.com/tstyche/tstyche/pull/217))

## [2.0.0-rc.0] - 2024-06-03

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-2) page._

### Changed

- Add the `DiagnosticOrigin` class ([#216](https://github.com/tstyche/tstyche/pull/216))
- **Breaking!** Use `fetch()` global ([#214](https://github.com/tstyche/tstyche/pull/214))

### Fixed

- Allow `./` in the beginning of the `testFileMatch` patterns ([#215](https://github.com/tstyche/tstyche/pull/215))

## [2.0.0-beta.1] - 2024-05-27

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-2) page._

### Changed

- **Breaking!** Always set the `configFilePath` property in the resolved config ([#203](https://github.com/tstyche/tstyche/pull/203))
- **Breaking!** Use the `jsx-runtime` transform for output components ([#199](https://github.com/tstyche/tstyche/pull/199))
- **Breaking!** Drop support for Node.js 14 ([#198](https://github.com/tstyche/tstyche/pull/198))
- **Breaking!** Do not return the `Result` from test runner ([#188](https://github.com/tstyche/tstyche/pull/188))

### Fixed

- Always allow passing `cancellationToken` as an argument ([#206](https://github.com/tstyche/tstyche/pull/206))
- Support the `failFast` option in the watch mode ([#204](https://github.com/tstyche/tstyche/pull/204))
- Make sure recursive watch is available ([#200](https://github.com/tstyche/tstyche/pull/200))

### Added

- **New!** Watch the TSTyche config file for changes ([#208](https://github.com/tstyche/tstyche/pull/208), [#213](https://github.com/tstyche/tstyche/pull/213))
- Add the `TestFile` class ([#189](https://github.com/tstyche/tstyche/pull/189))

## [2.0.0-beta.0] - 2024-03-28

_If you are upgrading from previous version, please be sure to read the [release notes](https://tstyche.org/releases/tstyche-2) page._

### Changed

- **Breaking!** Allow selecting test files with any extensions ([#153](https://github.com/tstyche/tstyche/pull/153))
- **Breaking!** Deprecate `.toEqual()` in favour of `.toBe()` ([#151](https://github.com/tstyche/tstyche/pull/151))
- **Breaking!** Deprecate `.toBeAssignable()` in favour of `.toBeAssignableWith()` ([#142](https://github.com/tstyche/tstyche/pull/142))

### Added

- Do not allow `--watch` in CI environments ([#173](https://github.com/tstyche/tstyche/pull/173))
- **New!** Add the watch mode ([#170](https://github.com/tstyche/tstyche/pull/170))
- Add the `SelectService` class ([#165](https://github.com/tstyche/tstyche/pull/165))
- Collect and handle nested `expect()` assertions ([#156](https://github.com/tstyche/tstyche/pull/156))
- **New!** Add `.toBe()` matcher ([#151](https://github.com/tstyche/tstyche/pull/151))
- **New!** Add `.toBeAssignableTo()` and `.toBeAssignableWith()` matchers ([#141](https://github.com/tstyche/tstyche/pull/141))

## [1.1.0] - 2024-02-27

### Added

- **New!** Support for Node.js 14 ([#136](https://github.com/tstyche/tstyche/pull/136))
- Add the `CancellationToken` class ([#135](https://github.com/tstyche/tstyche/pull/135))

### Fixed

- Improve behavior of timeout errors ([#133](https://github.com/tstyche/tstyche/pull/133), [#134](https://github.com/tstyche/tstyche/pull/134))

## [1.0.0] - 2024-02-20

_Stable release based on [1.0.0-rc.2]._

## [1.0.0-rc.2] - 2024-02-14

### Fixed

- Use the `isTypeRelatedTo()` method directly, to make strict subtype checks possible ([#127](https://github.com/tstyche/tstyche/pull/127), [#126](https://github.com/tstyche/tstyche/pull/126))

## [1.0.0-rc.1] - 2024-02-10

### Changed

- **Breaking!** Remove the `disableTestFileLookup` option in favor of `testFileMatch: []` ([#121](https://github.com/tstyche/tstyche/pull/121))

### Added

- **New!** Set `module: "preserve"` in the default compiler options for inferred project that are using TypeScript 5.4 and up ([#111](https://github.com/tstyche/tstyche/pull/111))

### Fixed

- Do not select test files, if `testFileMatch` is an empty list ([#120](https://github.com/tstyche/tstyche/pull/120))

## [1.0.0-rc] - 2024-01-28

### Changed

- **Breaking!** Replace the `allowNoTestFiles` option with `disableTestFileLookup` ([#104](https://github.com/tstyche/tstyche/pull/104))

### Added

- **New!** Set default compiler options for inferred (e.g. JavaScript) projects ([#93](https://github.com/tstyche/tstyche/pull/93))
- Add the `TSTYCHE_NO_INTERACTIVE` environment variable ([#88](https://github.com/tstyche/tstyche/pull/88))
- Add the `TSTYCHE_TYPESCRIPT_PATH` environment variable ([#84](https://github.com/tstyche/tstyche/pull/84))

### Fixed

- Only select TypeScript and JavaScript files for test run ([#105](https://github.com/tstyche/tstyche/pull/105))

## [1.0.0-beta.9] - 2024-01-05

### Fixed

- Fix `"target": ["current"]` support for TypeScript 5.2 and below ([#83](https://github.com/tstyche/tstyche/pull/83))

## [1.0.0-beta.8] - 2024-01-05

### Changed

- **Breaking!** Make `"target": ["current"]` the default instead of `"target": ["latest"]` ([#81](https://github.com/tstyche/tstyche/pull/81), [#80](https://github.com/tstyche/tstyche/pull/80), [#66](https://github.com/tstyche/tstyche/pull/66))
- **New!** Load the installed TypeScript package for type testing instead of installing another copy to the store ([#71](https://github.com/tstyche/tstyche/pull/71), [#64](https://github.com/tstyche/tstyche/pull/64))

### Added

- Add the `Path` class ([#59](https://github.com/tstyche/tstyche/pull/59))

### Fixed

- Correctly handle command line options that do not take a value ([#58](https://github.com/tstyche/tstyche/pull/58))

## [1.0.0-beta.7] - 2023-12-29

### Changed

- **Breaking!** Add new `Expect` class to validate provided values and orchestrate matchers logic ([#39](https://github.com/tstyche/tstyche/pull/39))

### Added

- **New!** Load local language service plugins to support files like `.svelte` or `.vue` ([#56](https://github.com/tstyche/tstyche/pull/56))

### Fixed

- Make the source argument checks stricter for the `.toHaveProperty()` matcher ([#46](https://github.com/tstyche/tstyche/pull/46))

## [1.0.0-beta.6] - 2023-12-03

### Added

- **New!** Add `.toHaveProperty()` matcher ([#36](https://github.com/tstyche/tstyche/pull/36))

### Fixed

- Accept template literals as arguments of the `.toRaiseError()` matcher ([#38](https://github.com/tstyche/tstyche/pull/38))

## [1.0.0-beta.5] - 2023-11-27

### Changed

- **Breaking!** Move retry logic to the `Lock` class ([#31](https://github.com/tstyche/tstyche/pull/31))
- Bring back support for Node.js 16 ([#28](https://github.com/tstyche/tstyche/pull/28), [#27](https://github.com/tstyche/tstyche/pull/27))

### Added

- **New!** Add support for the `current` target tag ([#33](https://github.com/tstyche/tstyche/pull/33))

### Fixed

- Allow `.raiseError()` to take template literals as arguments ([#35](https://github.com/tstyche/tstyche/pull/35))

## [1.0.0-beta.4] - 2023-11-24

### Added

- Use Node.js Fetch API ([#23](https://github.com/tstyche/tstyche/pull/23))

### Removed

- **Breaking!** Remove the `context()` helper ([#24](https://github.com/tstyche/tstyche/pull/24))
- **Breaking!** Drop support for Node.js 16 ([#22](https://github.com/tstyche/tstyche/pull/22))
- **Breaking!** Rename methods of the `StoreService` class ([`5d74201`](https://github.com/tstyche/tstyche/commit/5d74201))

### Fixed

- Tune up behavior of `.skip` and `.only` run mode flags ([#25](https://github.com/tstyche/tstyche/pull/25))
- Clean up error messages of primitive type matchers ([#21](https://github.com/tstyche/tstyche/pull/21))
- Normalize `installationPath` path output ([#19](https://github.com/tstyche/tstyche/pull/19))

## [1.0.0-beta.3] - 2023-11-13

### Fixed

- Support 'node10' and 'node16' resolutions ([`7dd805a`](https://github.com/tstyche/tstyche/commit/7dd805a), [`9c83e79`](https://github.com/tstyche/tstyche/commit/9c83e79))

## [1.0.0-beta.2] - 2023-11-12

### Fixed

- Support 'node10' resolution ([#7](https://github.com/tstyche/tstyche/pull/7))

## [1.0.0-beta.1] - 2023-11-09

### Fixed

- Include 'cjs' files in the published package ([`90b6473`](https://github.com/tstyche/tstyche/commit/90b6473))

## [1.0.0-beta.0] - 2023-11-09

_First pre-release._

[4.0.0-beta.9]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.9
[4.0.0-beta.8]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.8
[4.0.0-beta.7]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.7
[4.0.0-beta.6]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.6
[4.0.0-beta.5]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.5
[4.0.0-beta.4]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.4
[4.0.0-beta.3]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.3
[4.0.0-beta.2]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.2
[4.0.0-beta.1]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.1
[4.0.0-beta.0]: https://github.com/tstyche/tstyche/releases/tag/v4.0.0-beta.0
[3.5.0]: https://github.com/tstyche/tstyche/releases/tag/v3.5.0
[3.4.0]: https://github.com/tstyche/tstyche/releases/tag/v3.4.0
[3.3.1]: https://github.com/tstyche/tstyche/releases/tag/v3.3.1
[3.3.0]: https://github.com/tstyche/tstyche/releases/tag/v3.3.0
[3.2.0]: https://github.com/tstyche/tstyche/releases/tag/v3.2.0
[3.1.1]: https://github.com/tstyche/tstyche/releases/tag/v3.1.1
[3.1.0]: https://github.com/tstyche/tstyche/releases/tag/v3.1.0
[3.0.0]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0
[3.0.0-rc.2]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-rc.2
[3.0.0-rc.1]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-rc.1
[3.0.0-rc.0]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-rc.0
[3.0.0-beta.6]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-beta.6
[3.0.0-beta.5]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-beta.5
[3.0.0-beta.4]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-beta.4
[3.0.0-beta.3]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-beta.3
[3.0.0-beta.2]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-beta.2
[3.0.0-beta.1]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-beta.1
[3.0.0-beta.0]: https://github.com/tstyche/tstyche/releases/tag/v3.0.0-beta.0
[2.1.1]: https://github.com/tstyche/tstyche/releases/tag/v2.1.1
[2.1.0]: https://github.com/tstyche/tstyche/releases/tag/v2.1.0
[2.0.0]: https://github.com/tstyche/tstyche/releases/tag/v2.0.0
[2.0.0-rc.2]: https://github.com/tstyche/tstyche/releases/tag/v2.0.0-rc.2
[2.0.0-rc.1]: https://github.com/tstyche/tstyche/releases/tag/v2.0.0-rc.1
[2.0.0-rc.0]: https://github.com/tstyche/tstyche/releases/tag/v2.0.0-rc.0
[2.0.0-beta.1]: https://github.com/tstyche/tstyche/releases/tag/v2.0.0-beta.1
[2.0.0-beta.0]: https://github.com/tstyche/tstyche/releases/tag/v2.0.0-beta.0
[1.1.0]: https://github.com/tstyche/tstyche/releases/tag/v1.1.0
[1.0.0]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0
[1.0.0-rc.2]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-rc.2
[1.0.0-rc.1]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-rc.1
[1.0.0-rc]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-rc
[1.0.0-beta.9]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.9
[1.0.0-beta.8]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.8
[1.0.0-beta.7]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.7
[1.0.0-beta.6]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.6
[1.0.0-beta.5]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.5
[1.0.0-beta.4]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.4
[1.0.0-beta.3]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.3
[1.0.0-beta.2]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.2
[1.0.0-beta.1]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.1
[1.0.0-beta.0]: https://github.com/tstyche/tstyche/releases/tag/v1.0.0-beta.0
