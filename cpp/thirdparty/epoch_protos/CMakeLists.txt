# Local EpochProtos installation
cmake_minimum_required(VERSION 3.20)
project(epoch_protos_local)

# Create an interface library that wraps the prebuilt static library
add_library(epoch_protos_cpp INTERFACE)

# Set the include directories
target_include_directories(epoch_protos_cpp INTERFACE
    ${CMAKE_CURRENT_LIST_DIR}/include
)

# Link to the prebuilt static library
target_link_libraries(epoch_protos_cpp INTERFACE
    ${CMAKE_CURRENT_LIST_DIR}/lib/libepoch_protos_cpp.a
)

# Find and link protobuf dependency
find_package(Protobuf REQUIRED)
target_link_libraries(epoch_protos_cpp INTERFACE protobuf::libprotobuf)

# Add aliases for compatibility
add_library(EpochProtos::epoch_protos_cpp ALIAS epoch_protos_cpp)
add_library(epoch::proto ALIAS epoch_protos_cpp)
