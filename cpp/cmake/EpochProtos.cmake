# EpochProtos.cmake
#
# This is a helper file to include EpochProtos
include(FetchContent)

set(EPOCH_PROTOS_REPOSITORY "${REPO_URL}/EPOCHDevs/EpochProtos.git" CACHE STRING "EpochProtos repository URL")
set(EPOCH_PROTOS_TAG "main" CACHE STRING "EpochProtos Git tag to use")

# Disable Python and TypeScript generation for C++ only builds
set(BUILD_PYTHON_PROTOS OFF CACHE BOOL "")
set(BUILD_TYPESCRIPT_PROTOS OFF CACHE BOOL "")

# Disable vcpkg manifest mode for EpochProtos to prevent conflicts
# The parent project will handle all vcpkg dependencies
set(VCPKG_MANIFEST_MODE OFF)

FetchContent_Declare(
    EpochProtos
    GIT_REPOSITORY ${EPOCH_PROTOS_REPOSITORY}
    GIT_TAG ${EPOCH_PROTOS_TAG}
)

FetchContent_MakeAvailable(EpochProtos)

message(STATUS "EpochProtos fetched and built from source")
