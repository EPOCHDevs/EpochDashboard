cmake_minimum_required(VERSION 3.31)

set(GIT_TOKEN "" CACHE STRING "Default GIT TOKEN")
option(BUILD_SHARED_LIBS "Build libraries as shared instead of static" ON)
message(STATUS "Building SHARED libraries as ${BUILD_SHARED_LIBS}")
if(BUILD_SHARED_LIBS)
    message(STATUS "Building SHARED libraries")
    set(CMAKE_POSITION_INDEPENDENT_CODE ON)
else()
    message(STATUS "Building STATIC libraries")
    set(CMAKE_POSITION_INDEPENDENT_CODE OFF)
endif()

# Set binary and library output directories to keep build files separate from source
set(PROJECT_VERSION 0.1.0)
set(PROJECT_VERSION_MAJOR 0.1.0)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin)
set(CMAKE_LIBRARY_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)
set(CMAKE_ARCHIVE_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/lib)

# Enable vcpkg manifest mode (uses vcpkg.json)
set(DEPENDENCY_DIR "/usr/local" CACHE STRING "Dependency directory")
set(CMAKE_TOOLCHAIN_FILE $ENV{HOME}/vcpkg/scripts/buildsystems/vcpkg.cmake CACHE STRING "Vcpkg toolchain file")
set(VCPKG_MANIFEST_MODE ON)
set(VCPKG_FEATURE_FLAGS "versions")

option(BUILD_TEST OFF)
option(ENABLE_COVERAGE "Enable code coverage reporting" OFF)

########################################################################################################################

project(EpochDashboard LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

if (GIT_TOKEN)
    SET(REPO_URL "https://${GIT_TOKEN}:@github.com")
    message("REPO URL: https://************:@github.com")
else ()
    SET(REPO_URL "https://github.com")
    message("REPO URL: ${REPO_URL}")
endif ()

if (BUILD_TEST)
    # Find Catch2 for both tests and benchmarks
    find_package(Catch2 3 REQUIRED)

    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -g -O0 --coverage")
    enable_testing()
endif()

include(${PROJECT_SOURCE_DIR}/cmake/EpochDataSDK.cmake)

add_library(epoch_dashboard "")
add_library(epoch::dashboard ALIAS epoch_dashboard)

find_package(glaze REQUIRED)
find_package(spdlog REQUIRED)

set_target_properties(epoch_dashboard PROPERTIES
        VERSION ${PROJECT_VERSION}
        SOVERSION ${PROJECT_VERSION_MAJOR}
        WINDOWS_EXPORT_ALL_SYMBOLS ON
)

if(BUILD_SHARED_LIBS)
    set_target_properties(epoch_dashboard PROPERTIES
            CXX_VISIBILITY_PRESET default
            VISIBILITY_INLINES_HIDDEN OFF
    )
endif()

target_compile_definitions(epoch_dashboard PUBLIC -DSPDLOG_USE_STD_FORMAT)

target_include_directories(epoch_dashboard
        PUBLIC
        ${PROJECT_SOURCE_DIR}/include
        ${PROJECT_SOURCE_DIR}/thirdparty/epoch_protos/include
        PRIVATE
        ${PROJECT_SOURCE_DIR}/src
)

target_compile_options(epoch_dashboard PRIVATE -Wall -Wextra -Werror)

# Add thirdparty subdirectory before linking
add_subdirectory(src)

# Prefer static protobuf when bundling
if(BUNDLE_PROTOBUF_RUNTIME)
    set(Protobuf_USE_STATIC_LIBS ON)
endif()
find_package(Protobuf REQUIRED)
target_link_libraries(epoch_dashboard PUBLIC
        epoch::data_sdk
        glaze::glaze
        spdlog::spdlog_header_only
        ${PROJECT_SOURCE_DIR}/thirdparty/epoch_protos/lib/libepoch_protos_cpp.a
        protobuf::libprotobuf)

if (BUILD_TEST)
    add_subdirectory(tests)
endif()
