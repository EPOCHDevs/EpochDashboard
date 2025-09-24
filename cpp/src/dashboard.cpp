#include <string>

namespace epoch_dashboard {

// Version information
const std::string& getVersion() {
    static const std::string version = "0.1.0";
    return version;
}

} // namespace epoch_dashboard