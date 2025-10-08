#include "epoch_dashboard/tearsheet/validation_utils.h"
#include <sstream>
#include <iomanip>

namespace epoch_tearsheet {

bool ValidationUtils::isMonotonicallyIncreasing(const std::vector<epoch_proto::Point>& points) {
    if (points.size() <= 1) {
        return true;
    }

    for (size_t i = 1; i < points.size(); ++i) {
        if (points[i].x() < points[i - 1].x()) {
            return false;
        }
    }
    return true;
}

bool ValidationUtils::isMonotonicallyIncreasing(const epoch_proto::Line& line) {
    std::vector<epoch_proto::Point> points;
    points.reserve(line.data_size());
    for (const auto& point : line.data()) {
        points.push_back(point);
    }
    return isMonotonicallyIncreasing(points);
}

bool ValidationUtils::hasDuplicateXValues(const std::vector<epoch_proto::Point>& points) {
    std::unordered_set<int64_t> x_values;
    for (const auto& point : points) {
        if (!x_values.insert(point.x()).second) {
            return true;
        }
    }
    return false;
}

bool ValidationUtils::hasDuplicateXValues(const epoch_proto::Line& line) {
    std::unordered_set<int64_t> x_values;
    for (const auto& point : line.data()) {
        if (!x_values.insert(point.x()).second) {
            return true;
        }
    }
    return false;
}

void ValidationUtils::validateFiniteValues(const std::vector<epoch_proto::Point>& points) {
    for (size_t i = 0; i < points.size(); ++i) {
        if (!std::isfinite(points[i].y())) {
            std::stringstream ss;
            ss << "Invalid data point at index " << i << ": ";
            if (std::isnan(points[i].y())) {
                ss << "NaN value found";
            } else {
                ss << "Infinite value found";
            }
            throw std::runtime_error(ss.str());
        }
        // x is int64_t so no need to check for NaN/Inf
    }
}

void ValidationUtils::validateFiniteValues(const epoch_proto::Line& line) {
    for (int i = 0; i < line.data_size(); ++i) {
        const auto& point = line.data(i);
        if (!std::isfinite(point.y())) {
            std::stringstream ss;
            ss << "Invalid data point in line '" << line.name() << "' at index " << i << ": ";
            if (std::isnan(point.y())) {
                ss << "NaN value found";
            } else {
                ss << "Infinite value found";
            }
            throw std::runtime_error(ss.str());
        }
    }
}

void ValidationUtils::sortByX(std::vector<epoch_proto::Point>& points) {
    std::sort(points.begin(), points.end(),
              [](const epoch_proto::Point& a, const epoch_proto::Point& b) {
                  return a.x() < b.x();
              });
}

void ValidationUtils::sortByX(epoch_proto::Line& line) {
    std::vector<epoch_proto::Point> points;
    points.reserve(line.data_size());
    for (const auto& point : line.data()) {
        points.push_back(point);
    }

    sortByX(points);

    line.clear_data();
    for (const auto& point : points) {
        *line.add_data() = point;
    }
}

void ValidationUtils::validateLineData(epoch_proto::Line& line, const ValidationOptions& options) {
    if (line.data_size() == 0) {
        if (options.strict_validation) {
            throw std::runtime_error("Empty data provided to line chart builder for line: " + line.name());
        }
        return;
    }

    // Check for finite values if requested
    if (options.check_finite) {
        validateFiniteValues(line);
    }

    // Check for monotonic increasing
    if (!isMonotonicallyIncreasing(line)) {
        if (options.auto_sort) {
            sortByX(line);
        } else if (options.strict_validation) {
            std::vector<epoch_proto::Point> points;
            for (const auto& point : line.data()) {
                points.push_back(point);
            }
            throw std::runtime_error(getMonotonicErrorMessage(points));
        }
    }

    // Check for duplicates
    if (!options.allow_duplicates && hasDuplicateXValues(line)) {
        if (options.strict_validation) {
            std::vector<epoch_proto::Point> points;
            for (const auto& point : line.data()) {
                points.push_back(point);
            }
            throw std::runtime_error(getDuplicateErrorMessage(points));
        }
    }
}

void ValidationUtils::validateMultipleLines(const std::vector<epoch_proto::Line>& lines, bool require_same_x) {
    if (lines.empty()) {
        return;
    }

    // Validate each line individually
    for (const auto& line : lines) {
        if (line.data_size() == 0) {
            throw std::runtime_error("Empty line data found in line: " + line.name());
        }
        validateFiniteValues(line);
    }

    // If same x-values are required (e.g., for stacked charts)
    if (require_same_x && lines.size() > 1) {
        const auto& first_line = lines[0];
        std::unordered_set<int64_t> first_x_values;

        for (const auto& point : first_line.data()) {
            first_x_values.insert(point.x());
        }

        for (size_t i = 1; i < lines.size(); ++i) {
            const auto& line = lines[i];

            if (line.data_size() != first_line.data_size()) {
                std::stringstream ss;
                ss << "Inconsistent data sizes for stacked chart. Line '" << first_line.name()
                   << "' has " << first_line.data_size() << " points, but line '"
                   << line.name() << "' has " << line.data_size() << " points";
                throw std::runtime_error(ss.str());
            }

            for (const auto& point : line.data()) {
                if (first_x_values.find(point.x()) == first_x_values.end()) {
                    std::stringstream ss;
                    ss << "Inconsistent x-values for stacked chart. Line '" << line.name()
                       << "' has x-value " << point.x() << " not found in first line";
                    throw std::runtime_error(ss.str());
                }
            }
        }
    }
}

void ValidationUtils::validateXRangePoints(const std::vector<epoch_proto::XRangePoint>& points) {
    for (size_t i = 0; i < points.size(); ++i) {
        const auto& point = points[i];
        if (point.x() >= point.x2()) {
            std::stringstream ss;
            ss << "Invalid XRange point at index " << i << ": x (" << point.x()
               << ") must be less than x2 (" << point.x2() << ")";
            throw std::runtime_error(ss.str());
        }
    }
}

void ValidationUtils::validateBarData(const epoch_proto::BarData& bar_data, bool allow_negative) {
    if (bar_data.values_size() == 0) {
        throw std::runtime_error("Empty bar data provided for series: " + bar_data.name());
    }

    if (!allow_negative) {
        for (int i = 0; i < bar_data.values_size(); ++i) {
            if (bar_data.values(i) < 0) {
                std::stringstream ss;
                ss << "Negative value " << bar_data.values(i) << " found at index " << i
                   << " in bar series '" << bar_data.name() << "'. Negative values not allowed for stacked bars";
                throw std::runtime_error(ss.str());
            }
        }
    }

    // Check for finite values
    for (int i = 0; i < bar_data.values_size(); ++i) {
        if (!std::isfinite(bar_data.values(i))) {
            std::stringstream ss;
            ss << "Invalid value in bar series '" << bar_data.name() << "' at index " << i << ": ";
            if (std::isnan(bar_data.values(i))) {
                ss << "NaN value found";
            } else {
                ss << "Infinite value found";
            }
            throw std::runtime_error(ss.str());
        }
    }
}

void ValidationUtils::validateHistogramBins(uint32_t bins_count, size_t data_size) {
    if (bins_count == 0) {
        throw std::runtime_error("Histogram bins_count must be greater than 0");
    }

    if (data_size == 0) {
        throw std::runtime_error("Cannot create histogram from empty data");
    }

    if (bins_count > data_size) {
        std::stringstream ss;
        ss << "Histogram bins_count (" << bins_count
           << ") cannot be greater than data size (" << data_size << ")";
        throw std::runtime_error(ss.str());
    }
}

std::string ValidationUtils::getMonotonicErrorMessage(const std::vector<epoch_proto::Point>& points) {
    for (size_t i = 1; i < points.size(); ++i) {
        if (points[i].x() < points[i - 1].x()) {
            std::stringstream ss;
            ss << "Chart data must be monotonically increasing on x-axis. Found x["
               << (i - 1) << "]=" << points[i - 1].x()
               << " > x[" << i << "]=" << points[i].x()
               << ". Consider enabling auto_sort option or sorting your data before adding to chart.";
            return ss.str();
        }
    }
    return "Data is not monotonically increasing";
}

std::string ValidationUtils::getDuplicateErrorMessage(const std::vector<epoch_proto::Point>& points) {
    std::unordered_set<int64_t> seen;
    for (size_t i = 0; i < points.size(); ++i) {
        if (!seen.insert(points[i].x()).second) {
            std::stringstream ss;
            ss << "Duplicate x-values detected at position " << i
               << " (x=" << points[i].x() << "). "
               << "Charts require unique x-coordinates for proper rendering.";
            return ss.str();
        }
    }
    return "Duplicate x-values found";
}

} // namespace epoch_tearsheet