# Changelog
All notable changes to this project will be documented in this file.
## [0.1.1] - 2021-01-07
### Changed
- bridgeId toUpperCase

## [0.1.1] - 2021-01-07
### Changed
- simplify HueBuilder.

## [0.1.0] - 2021-01-07
### Changed
- upnp is more intelligent. Follows concept of deconz.
- allow stopping of upnp server.
- add mac to HueBuilder which can then provide useful methods like shortMac and bridgeId.
- improve and simplify logging.
- add interface for http server so it is easier to replace the used library.
- replaced express with fastify.

### Fixed
- wrong parameter provided in pairing callback.
- group api parameters.

## [0.0.10] - 2020-12-06
### Changed
- allow configuration of upnp port. If not set default 1900 is used

## [0.0.9] - 2020-11-21
### Changed
- update upnp binding so it does not pick wrong interface in case multiple networkf interfaces are used. Thanks Arvid! Sorry that it took so long.

## [0.0.8] - 2020-03-02
### Changed
- update discovery.xml

## [0.0.7] - 2020-02-28
### Added
- allow access to complete request object in all callback function

## [0.0.6] - 2020-02-28
### Added
- start with groups api

### Changed
- Made callback functions optional. If not specified fallback will handle the call

## [0.0.5] - 2020-02-28
### Added
- allows https connection as well
- add helper method for certificate generation
- new configuration due to https

### Changed
- restructure server so that apis can be separated
- some callback method changed

## [0.0.4] - 2020-02-28
### Fixed
- error handling in onState function

## [0.0.3] - 2020-02-27
### Fixed
- error handling and response

## [0.0.2] - 2020-02-27
### Added
- a lot of errors

## [0.0.1] - 2020-02-26
### Added
- initial implementation