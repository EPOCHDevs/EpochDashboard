#include "epoch_dashboard/tearsheet/lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/validation_utils.h"
#include "epoch_protos/common.pb.h"
#include <arrow/api.h>
#include <epoch_frame/dataframe.h>
#include <epoch_frame/index.h>

namespace epoch_tearsheet {

LinesChartBuilder::LinesChartBuilder() {
    lines_def_.mutable_chart_def()->set_type(epoch_proto::WidgetLines);
    setYAxisType(epoch_proto::AxisLinear);
    setXAxisType(epoch_proto::AxisDateTime);
    // Default validation options
    validation_options_.strict_validation = true;
    validation_options_.check_finite = true;
}

LinesChartBuilder& LinesChartBuilder::addLine(const epoch_proto::Line& line) {
    // Validate the line data before adding
    epoch_proto::Line validated_line = line;
    ValidationUtils::validateLineData(validated_line, validation_options_);
    *lines_def_.add_lines() = validated_line;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::addLines(const std::vector<epoch_proto::Line>& lines) {
    for (const auto& line : lines) {
        // Validate each line before adding
        epoch_proto::Line validated_line = line;
        ValidationUtils::validateLineData(validated_line, validation_options_);
        *lines_def_.add_lines() = validated_line;
    }

    // Additional validation for multiple lines if stacked
    if (lines_def_.stacked() && lines.size() > 1) {
        std::vector<epoch_proto::Line> added_lines;
        for (const auto& line : lines_def_.lines()) {
            added_lines.push_back(line);
        }
        ValidationUtils::validateMultipleLines(added_lines, true);
    }

    return *this;
}

LinesChartBuilder& LinesChartBuilder::addStraightLine(const epoch_proto::StraightLineDef& line) {
    *lines_def_.add_straight_lines() = line;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::addYPlotBand(const epoch_proto::Band& band) {
    *lines_def_.add_y_plot_bands() = band;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::addXPlotBand(const epoch_proto::Band& band) {
    *lines_def_.add_x_plot_bands() = band;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::setOverlay(const epoch_proto::Line& overlay) {
    *lines_def_.mutable_overlay() = overlay;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::setStacked(bool stacked) {
    lines_def_.set_stacked(stacked);
    return *this;
}

void LinesChartBuilder::processDataFrameWithTimestampIndex(const epoch_frame::DataFrame& df,
                                                            const std::vector<std::string>& y_cols,
                                                            std::vector<epoch_proto::Line>& lines) {
    auto arrow_table = df.table();
    auto timestamp_array = df.index()->array().to_timestamp_view();

    // Get the timestamp type to determine the time unit
    auto timestamp_type = std::static_pointer_cast<arrow::TimestampType>(timestamp_array->type());
    auto time_unit = timestamp_type->unit();

    for (const auto& y_col : y_cols) {
        epoch_proto::Line line;
        line.set_name(y_col);

        auto y_column = arrow_table->GetColumnByName(y_col);
        if (!y_column) {
            continue;
        }

        for (int64_t i = 0; i < std::min(timestamp_array->length(), y_column->length()); ++i) {
            auto y_result = y_column->GetScalar(i);

            if (y_result.ok()) {
                auto y_scalar = y_result.ValueOrDie();

                if (y_scalar->is_valid && !timestamp_array->IsNull(i)) {
                    auto* point = line.add_data();
                    int64_t timestamp_value = timestamp_array->Value(i);
                    point->set_x(DataFrameFactory::toMilliseconds(timestamp_value, time_unit));
                    point->set_y(std::static_pointer_cast<arrow::DoubleScalar>(y_scalar)->value);
                }
            }
        }

        lines.push_back(line);
    }
}

template<typename IndexType>
void LinesChartBuilder::processDataFrameWithIntegerIndex(const epoch_frame::DataFrame& df,
                                                          const std::vector<std::string>& y_cols,
                                                          std::vector<epoch_proto::Line>& lines) {
    auto arrow_table = df.table();
    auto index_array = df.index()->array().template to_view<IndexType>();

    for (const auto& y_col : y_cols) {
        epoch_proto::Line line;
        line.set_name(y_col);

        auto y_column = arrow_table->GetColumnByName(y_col);
        if (!y_column) {
            continue;
        }

        for (int64_t i = 0; i < std::min(index_array->length(), y_column->length()); ++i) {
            auto y_result = y_column->GetScalar(i);

            if (y_result.ok()) {
                auto y_scalar = y_result.ValueOrDie();

                if (y_scalar->is_valid && !index_array->IsNull(i)) {
                    auto* point = line.add_data();
                    point->set_x(static_cast<int64_t>(index_array->Value(i)));
                    point->set_y(std::static_pointer_cast<arrow::DoubleScalar>(y_scalar)->value);
                }
            }
        }

        lines.push_back(line);
    }
}

LinesChartBuilder& LinesChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df,
                                                      const std::vector<std::string>& y_cols) {
    std::vector<epoch_proto::Line> lines;
    lines.reserve(y_cols.size());

    auto index_type = df.index()->array()->type();

    // Branch based on index type
    switch (index_type->id()) {
        case arrow::Type::TIMESTAMP:
            processDataFrameWithTimestampIndex(df, y_cols, lines);
            setXAxisType(epoch_proto::AxisDateTime);
            break;
        case arrow::Type::INT64:
            processDataFrameWithIntegerIndex<int64_t>(df, y_cols, lines);
            setXAxisType(epoch_proto::AxisLinear);
            break;
        case arrow::Type::UINT64:
            processDataFrameWithIntegerIndex<uint64_t>(df, y_cols, lines);
            setXAxisType(epoch_proto::AxisLinear);
            break;
        default:
            throw std::runtime_error("Unsupported index type for LinesChartBuilder. Supported types: timestamp, int64_t, uint64_t");
    }

    addLines(lines);
    setYAxisType(epoch_proto::AxisLinear);

    return *this;
}

LinesChartBuilder& LinesChartBuilder::setValidationOptions(const ValidationUtils::ValidationOptions& options) {
    validation_options_ = options;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::setAutoSort(bool auto_sort) {
    validation_options_.auto_sort = auto_sort;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::setStrictValidation(bool strict) {
    validation_options_.strict_validation = strict;
    return *this;
}

LinesChartBuilder& LinesChartBuilder::setAllowDuplicates(bool allow) {
    validation_options_.allow_duplicates = allow;
    return *this;
}

epoch_proto::Chart LinesChartBuilder::build() const {
    // Final validation of all lines before building
    if (validation_options_.strict_validation && lines_def_.stacked() && lines_def_.lines_size() > 1) {
        std::vector<epoch_proto::Line> all_lines;
        for (const auto& line : lines_def_.lines()) {
            all_lines.push_back(line);
        }
        ValidationUtils::validateMultipleLines(all_lines, true);
    }

    epoch_proto::Chart chart;
    *chart.mutable_lines_def() = lines_def_;
    return chart;
}

} // namespace epoch_tearsheet