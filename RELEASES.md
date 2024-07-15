# Releases

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

- Support TypeScript's 'node10' and 'node16' resolutions ([`7dd805a`](https://github.com/tstyche/tstyche/commit/7dd805a), [`9c83e79`](https://github.com/tstyche/tstyche/commit/9c83e79))

## [1.0.0-beta.2] - 2023-11-12

### Fixed

- Support TypeScript's 'node10' resolution ([#7](https://github.com/tstyche/tstyche/pull/7))

## [1.0.0-beta.1] - 2023-11-09

### Fixed

- Include 'cjs' files in the published package ([`90b6473`](https://github.com/tstyche/tstyche/commit/90b6473))

## [1.0.0-beta.0] - 2023-11-09

_First pre-release._

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
