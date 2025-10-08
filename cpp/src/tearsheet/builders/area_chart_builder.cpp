#include "epoch_dashboard/tearsheet/area_chart_builder.h"
#include "epoch_dashboard/tearsheet/dataframe_converter.h"
#include "epoch_dashboard/tearsheet/line_builder.h"
#include "epoch_dashboard/tearsheet/validation_utils.h"
#include "epoch_protos/common.pb.h"
#include <arrow/api.h>
#include <epoch_frame/dataframe.h>
#include <epoch_frame/index.h>

namespace epoch_tearsheet {

AreaChartBuilder::AreaChartBuilder() {
    area_def_.mutable_chart_def()->set_type(epoch_proto::WidgetArea);
    setYAxisType(epoch_proto::AxisLinear);
    setXAxisType(epoch_proto::AxisDateTime);
    // Default validation options
    validation_options_.strict_validation = true;
    validation_options_.check_finite = true;
}

AreaChartBuilder& AreaChartBuilder::addArea(const epoch_proto::Line& area) {
    // Validate the area data before adding
    epoch_proto::Line validated_area = area;
    ValidationUtils::validateLineData(validated_area, validation_options_);
    *area_def_.add_areas() = validated_area;
    return *this;
}

AreaChartBuilder& AreaChartBuilder::addAreas(const std::vector<epoch_proto::Line>& areas) {
    for (const auto& area : areas) {
        // Validate each area before adding
        epoch_proto::Line validated_area = area;
        ValidationUtils::validateLineData(validated_area, validation_options_);
        *area_def_.add_areas() = validated_area;
    }

    // Additional validation for stacked areas
    if (area_def_.stacked() && areas.size() > 1) {
        std::vector<epoch_proto::Line> all_areas;
        for (const auto& area : area_def_.areas()) {
            all_areas.push_back(area);
        }
        ValidationUtils::validateMultipleLines(all_areas, true);
    }

    return *this;
}

AreaChartBuilder& AreaChartBuilder::setStacked(bool stacked) {
    area_def_.set_stacked(stacked);
    return *this;
}

AreaChartBuilder& AreaChartBuilder::setStackType(epoch_proto::StackType stack_type) {
    area_def_.set_stack_type(stack_type);
    return *this;
}

AreaChartBuilder& AreaChartBuilder::fromDataFrame(const epoch_frame::DataFrame& df,
                                                    const std::vector<std::string>& y_cols) {
    std::vector<epoch_proto::Line> areas;
    areas.reserve(y_cols.size());

    auto arrow_table = df.table();
    auto timestamp_array = df.index()->array().to_timestamp_view();

    // Get the timestamp type to determine the time unit
    auto timestamp_type = std::static_pointer_cast<arrow::TimestampType>(timestamp_array->type());
    auto time_unit = timestamp_type->unit();

    for (const auto& y_col : y_cols) {
        epoch_proto::Line area;
        area.set_name(y_col);

        auto y_column = arrow_table->GetColumnByName(y_col);
        if (!y_column) {
            continue;
        }

        for (int64_t i = 0; i < std::min(timestamp_array->length(), y_column->length()); ++i) {
            auto y_result = y_column->GetScalar(i);

            if (y_result.ok()) {
                auto y_scalar = y_result.ValueOrDie();

                if (y_scalar->is_valid && !timestamp_array->IsNull(i)) {
                    auto* point = area.add_data();
                    // Convert timestamp to milliseconds using the proper time unit
                    int64_t timestamp_value = timestamp_array->Value(i);
                    point->set_x(DataFrameFactory::toMilliseconds(timestamp_value, time_unit));
                    point->set_y(std::static_pointer_cast<arrow::DoubleScalar>(y_scalar)->value);
                }
            }
        }

        areas.push_back(area);
    }

    addAreas(areas);

    // Set appropriate axis definitions for area charts (using timestamp index like lines)
    setXAxisType(epoch_proto::AxisDateTime);
    setYAxisType(epoch_proto::AxisLinear);

    return *this;
}

AreaChartBuilder& AreaChartBuilder::setValidationOptions(const ValidationUtils::ValidationOptions& options) {
    validation_options_ = options;
    return *this;
}

AreaChartBuilder& AreaChartBuilder::setAutoSort(bool auto_sort) {
    validation_options_.auto_sort = auto_sort;
    return *this;
}

AreaChartBuilder& AreaChartBuilder::setStrictValidation(bool strict) {
    validation_options_.strict_validation = strict;
    return *this;
}

epoch_proto::Chart AreaChartBuilder::build() const {
    // Final validation for stacked areas
    if (validation_options_.strict_validation && area_def_.stacked() && area_def_.areas_size() > 1) {
        std::vector<epoch_proto::Line> all_areas;
        for (const auto& area : area_def_.areas()) {
            all_areas.push_back(area);
        }
        ValidationUtils::validateMultipleLines(all_areas, true);
    }

    epoch_proto::Chart chart;
    *chart.mutable_area_def() = area_def_;
    return chart;
}

} // namespace epoch_tearsheet