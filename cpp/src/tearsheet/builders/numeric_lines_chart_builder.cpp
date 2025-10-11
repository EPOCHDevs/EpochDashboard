#include "epoch_dashboard/tearsheet/numeric_lines_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/validation_utils.h"
#include "epoch_protos/common.pb.h"
#include <arrow/api.h>
#include <epoch_frame/dataframe.h>
#include <epoch_frame/index.h>

namespace epoch_tearsheet {

NumericLinesChartBuilder::NumericLinesChartBuilder() {
    numeric_lines_def_.mutable_chart_def()->set_type(epoch_proto::WidgetLines);
    setYAxisType(epoch_proto::AxisLinear);
    setXAxisType(epoch_proto::AxisLinear);
    // Default validation options
    validation_options_.strict_validation = true;
    validation_options_.check_finite = true;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::addLine(const epoch_proto::NumericLine& line) {
    // TODO: Add validation for NumericLine when ValidationUtils supports it
    *numeric_lines_def_.add_lines() = line;
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::addLines(const std::vector<epoch_proto::NumericLine>& lines) {
    for (const auto& line : lines) {
        // TODO: Add validation for NumericLine when ValidationUtils supports it
        *numeric_lines_def_.add_lines() = line;
    }

    // TODO: Add validation for multiple numeric lines if stacked
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::addStraightLine(const epoch_proto::StraightLineDef& line) {
    *numeric_lines_def_.add_straight_lines() = line;
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::addYPlotBand(const epoch_proto::Band& band) {
    *numeric_lines_def_.add_y_plot_bands() = band;
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::addXPlotBand(const epoch_proto::Band& band) {
    *numeric_lines_def_.add_x_plot_bands() = band;
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::setOverlay(const epoch_proto::NumericLine& overlay) {
    *numeric_lines_def_.mutable_overlay() = overlay;
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::setStacked(bool stacked) {
    numeric_lines_def_.set_stacked(stacked);
    return *this;
}

template<typename IndexType>
void NumericLinesChartBuilder::processDataFrameWithNumericIndex(const epoch_frame::DataFrame& df,
                                                                  const std::vector<std::string>& y_cols,
                                                                  std::vector<epoch_proto::NumericLine>& lines) {
    auto arrow_table = df.table();
    auto index_array = df.index()->array().template to_view<IndexType>();

    for (const auto& y_col : y_cols) {
        epoch_proto::NumericLine line;
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
                    point->set_x(static_cast<double>(index_array->Value(i)));
                    point->set_y(std::static_pointer_cast<arrow::DoubleScalar>(y_scalar)->value);
                }
            }
        }

        lines.push_back(line);
    }
}

NumericLinesChartBuilder& NumericLinesChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df,
                                                                     const std::vector<std::string>& y_cols) {
    std::vector<epoch_proto::NumericLine> lines;
    lines.reserve(y_cols.size());

    auto index_type = df.index()->array()->type();

    // Branch based on index type
    switch (index_type->id()) {
        case arrow::Type::INT64:
            processDataFrameWithNumericIndex<int64_t>(df, y_cols, lines);
            setXAxisType(epoch_proto::AxisLinear);
            break;
        case arrow::Type::UINT64:
            processDataFrameWithNumericIndex<uint64_t>(df, y_cols, lines);
            setXAxisType(epoch_proto::AxisLinear);
            break;
        case arrow::Type::DOUBLE:
            processDataFrameWithNumericIndex<double>(df, y_cols, lines);
            setXAxisType(epoch_proto::AxisLinear);
            break;
        case arrow::Type::FLOAT:
            processDataFrameWithNumericIndex<float>(df, y_cols, lines);
            setXAxisType(epoch_proto::AxisLinear);
            break;
        default:
            throw std::runtime_error("Unsupported index type for NumericLinesChartBuilder. Supported types: int64_t, uint64_t, float, double");
    }

    addLines(lines);
    setYAxisType(epoch_proto::AxisLinear);

    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::setValidationOptions(const ValidationUtils::ValidationOptions& options) {
    validation_options_ = options;
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::setAutoSort(bool auto_sort) {
    validation_options_.auto_sort = auto_sort;
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::setStrictValidation(bool strict) {
    validation_options_.strict_validation = strict;
    return *this;
}

NumericLinesChartBuilder& NumericLinesChartBuilder::setAllowDuplicates(bool allow) {
    validation_options_.allow_duplicates = allow;
    return *this;
}

epoch_proto::Chart NumericLinesChartBuilder::build() const {
    // TODO: Add final validation when ValidationUtils supports NumericLine
    epoch_proto::Chart chart;
    *chart.mutable_numeric_lines_def() = numeric_lines_def_;
    return chart;
}

} // namespace epoch_tearsheet