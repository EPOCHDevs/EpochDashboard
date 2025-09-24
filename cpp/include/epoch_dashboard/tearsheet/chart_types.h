#pragma once

#include <string>
#include <stdexcept>

namespace epoch_tearsheet {

struct PieSize {
    explicit PieSize(uint32_t percentage) : percentage_(percentage) {
        if (percentage_ > 100) {
            throw std::invalid_argument("Percentage must be between 0 and 100");
        }
    }

    std::string toString() const {
        return std::to_string(percentage_) + "%";
    }

    uint32_t value() const {
        return percentage_;
    }

private:
    uint32_t percentage_;
};

struct PieInnerSize {
    explicit PieInnerSize(uint32_t percentage) : percentage_(percentage) {
        if (percentage_ > 100) {
            throw std::invalid_argument("Percentage must be between 0 and 100");
        }
    }

    std::string toString() const {
        return std::to_string(percentage_) + "%";
    }

    uint32_t value() const {
        return percentage_;
    }

private:
    uint32_t percentage_;
};

} // namespace epoch_tearsheet