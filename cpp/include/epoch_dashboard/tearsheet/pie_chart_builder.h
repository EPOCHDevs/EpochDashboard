#pragma once

#include <string>
#include <vector>
#include <optional>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_dashboard/tearsheet/chart_builder_base.h"
#include "epoch_dashboard/tearsheet/chart_types.h"

namespace epoch_frame {
    class DataFrame;
}

namespace epoch_tearsheet {

class PieChartBuilder : public ChartBuilderBase<PieChartBuilder> {
public:
    PieChartBuilder();

    // Required for CRTP base class
    epoch_proto::ChartDef* getChartDefImpl() { return pie_def_.mutable_chart_def(); }

    // Chart-specific methods
    PieChartBuilder& addSeries(const std::string& name,
                                const std::vector<epoch_proto::PieData>& points,
                                const PieSize& size,
                                const std::optional<PieInnerSize>& inner_size = std::nullopt);
    PieChartBuilder& fromDataFrame(const epoch_frame::DataFrame& df,
                                    const std::string& name_col,
                                    const std::string& value_col,
                                    const std::string& series_name,
                                    const PieSize& size,
                                    const std::optional<PieInnerSize>& inner_size = std::nullopt);

    epoch_proto::Chart build() const;

private:
    epoch_proto::PieDef pie_def_;
};

} // namespace epoch_tearsheet