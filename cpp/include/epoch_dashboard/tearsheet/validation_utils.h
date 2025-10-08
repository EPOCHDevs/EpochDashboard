#pragma once

#include <vector>
#include <string>
#include <stdexcept>
#include <algorithm>
#include <unordered_set>
#include <cmath>
#include "epoch_protos/chart_def.pb.h"

namespace epoch_tearsheet {

/**
 * Validation utilities for chart builders
 * Provides common validation functions to ensure data integrity
 */
class ValidationUtils {
public:
    struct ValidationOptions {
        bool auto_sort = false;           // Automatically sort data if not monotonic
        bool strict_validation = true;    // Throw exception vs warning
        bool allow_duplicates = false;    // Allow duplicate x-values
        bool check_finite = true;         // Check for NaN/Inf values
    };

    /**
     * Check if a vector of points is monotonically increasing by x-value
     * @param points Vector of points to check
     * @return true if monotonically increasing, false otherwise
     */
    static bool isMonotonicallyIncreasing(const std::vector<epoch_proto::Point>& points);

    /**
     * Check if a line's data is monotonically increasing
     * @param line Line to check
     * @return true if monotonically increasing, false otherwise
     */
    static bool isMonotonicallyIncreasing(const epoch_proto::Line& line);

    /**
     * Check for duplicate x-values in points
     * @param points Vector of points to check
     * @return true if duplicates found, false otherwise
     */
    static bool hasDuplicateXValues(const std::vector<epoch_proto::Point>& points);

    /**
     * Check for duplicate x-values in a line
     * @param line Line to check
     * @return true if duplicates found, false otherwise
     */
    static bool hasDuplicateXValues(const epoch_proto::Line& line);

    /**
     * Validate that all points have finite values (no NaN or Inf)
     * @param points Vector of points to validate
     * @throws std::runtime_error if non-finite values found
     */
    static void validateFiniteValues(const std::vector<epoch_proto::Point>& points);

    /**
     * Validate that all points in a line have finite values
     * @param line Line to validate
     * @throws std::runtime_error if non-finite values found
     */
    static void validateFiniteValues(const epoch_proto::Line& line);

    /**
     * Sort points by x-value
     * @param points Vector of points to sort (modified in place)
     */
    static void sortByX(std::vector<epoch_proto::Point>& points);

    /**
     * Sort line data by x-value
     * @param line Line to sort (modified in place)
     */
    static void sortByX(epoch_proto::Line& line);

    /**
     * Validate line chart data
     * @param line Line to validate
     * @param options Validation options
     * @throws std::runtime_error if validation fails and strict_validation is true
     */
    static void validateLineData(epoch_proto::Line& line, const ValidationOptions& options);

    /**
     * Validate multiple lines for consistency (e.g., for stacked charts)
     * @param lines Vector of lines to validate
     * @param require_same_x Whether all lines must have same x-values
     * @throws std::runtime_error if validation fails
     */
    static void validateMultipleLines(const std::vector<epoch_proto::Line>& lines, bool require_same_x = false);

    /**
     * Validate XRange points
     * @param points Vector of XRange points to validate
     * @throws std::runtime_error if x >= x2 for any point
     */
    static void validateXRangePoints(const std::vector<epoch_proto::XRangePoint>& points);

    /**
     * Validate bar chart data
     * @param bar_data Bar data to validate
     * @param allow_negative Whether negative values are allowed
     * @throws std::runtime_error if validation fails
     */
    static void validateBarData(const epoch_proto::BarData& bar_data, bool allow_negative = true);

    /**
     * Validate histogram configuration
     * @param bins_count Number of bins
     * @param data_size Size of data
     * @throws std::runtime_error if bins_count is invalid
     */
    static void validateHistogramBins(uint32_t bins_count, size_t data_size);

    /**
     * Get detailed error message for monotonic violation
     * @param points Vector of points that failed validation
     * @return Error message string
     */
    static std::string getMonotonicErrorMessage(const std::vector<epoch_proto::Point>& points);

    /**
     * Get detailed error message for duplicate x-values
     * @param points Vector of points with duplicates
     * @return Error message string
     */
    static std::string getDuplicateErrorMessage(const std::vector<epoch_proto::Point>& points);
};

} // namespace epoch_tearsheet