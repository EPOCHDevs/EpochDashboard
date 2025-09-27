#pragma once

#include <string>
#include <vector>
#include <optional>

#include "epoch_protos/chart_def.pb.h"
#include "epoch_protos/table_def.pb.h"
#include "epoch_protos/common.pb.h"
#include "epoch_dashboard/tearsheet/line_builder.h"

namespace epoch_frame {
    class Series;
}

namespace epoch_tearsheet {

class SeriesFactory {
public:
    static epoch_proto::Array toArray(const epoch_frame::Series& series);

    static epoch_proto::Line toLine(const epoch_frame::Series& series,
                                   const std::string& name = "",
                                   const LineStyle& style = {});

    static std::vector<epoch_proto::Point> toPoints(const epoch_frame::Series& y_series);

    static epoch_proto::TableRow toTableRow(const epoch_frame::Series& series, uint64_t index);

    static std::vector<epoch_proto::TableRow> toTableRows(const epoch_frame::Series& series);
};

} // namespace epoch_tearsheet