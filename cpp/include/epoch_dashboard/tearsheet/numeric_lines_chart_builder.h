#pragma once

#include <string>
#include <vector>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"
#include "epoch_dashboard/tearsheet/validation_utils.h"

namespace epoch_frame {
    class DataFrame;
}

namespace epoch_tearsheet {

class NumericLinesChartBuilder : public ChartBuilderBase<NumericLinesChartBuilder> {
public:
    NumericLinesChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return numeric_lines_def_.mutable_chart_def(); }

    // Chart-specific methods
    NumericLinesChartBuilder& addLine(const epoch_proto::NumericLine& line);
    NumericLinesChartBuilder& addLines(const std::vector<epoch_proto::NumericLine>& lines);
    NumericLinesChartBuilder& addStraightLine(const epoch_proto::StraightLineDef& line);
    NumericLinesChartBuilder& addYPlotBand(const epoch_proto::Band& band);
    NumericLinesChartBuilder& addXPlotBand(const epoch_proto::Band& band);
    NumericLinesChartBuilder& setOverlay(const epoch_proto::NumericLine& overlay);
    NumericLinesChartBuilder& setStacked(bool stacked);
    NumericLinesChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df, const std::vector<std::string>& y_cols);

    // Validation configuration
    NumericLinesChartBuilder& setValidationOptions(const ValidationUtils::ValidationOptions& options);
    NumericLinesChartBuilder& setAutoSort(bool auto_sort);
    NumericLinesChartBuilder& setStrictValidation(bool strict);
    NumericLinesChartBuilder& setAllowDuplicates(bool allow);

    epoch_proto::Chart build() const;

private:
    epoch_proto::NumericLinesDef numeric_lines_def_;
    ValidationUtils::ValidationOptions validation_options_;

    template<typename IndexType>
    void processDataFrameWithNumericIndex(const epoch_frame::DataFrame& df,
                                           const std::vector<std::string>& y_cols,
                                           std::vector<epoch_proto::NumericLine>& lines);
};

} // namespace epoch_tearsheet