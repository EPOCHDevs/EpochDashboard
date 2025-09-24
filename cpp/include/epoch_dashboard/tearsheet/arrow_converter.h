#pragma once

#include <memory>
#include <vector>
#include <string>
#include <optional>

#include "epoch_protos/common.pb.h"
#include "epoch_protos/table_def.pb.h"
#include "epoch_protos/chart_def.pb.h"

#include <arrow/type_fwd.h>
#include <arrow/api.h>

namespace epoch_tearsheet {

// Configuration for Arrow to Proto conversion
struct ArrowConversionConfig {
    std::optional<int> maxRows;
    std::optional<int> maxColumns;
    bool includeSchema = true;
    bool preserveNulls = true;
    std::vector<std::string> includeColumns;
    std::vector<std::string> excludeColumns;
};

class ArrowConverter {
public:
    // Scalar conversions
    static epoch_proto::Scalar toProtoScalar(const std::shared_ptr<arrow::Scalar>& scalar);
    static std::shared_ptr<arrow::Scalar> fromProtoScalar(const epoch_proto::Scalar& proto);

    // Array conversions
    static epoch_proto::Array toProtoArray(const std::shared_ptr<arrow::Array>& array);
    static epoch_proto::Array toProtoArray(const std::shared_ptr<arrow::Array>& array,
                                          const ArrowConversionConfig& config);
    static std::shared_ptr<arrow::Array> fromProtoArray(const epoch_proto::Array& proto);

    // ChunkedArray conversions
    static epoch_proto::Array toProtoArray(const std::shared_ptr<arrow::ChunkedArray>& chunked);
    static epoch_proto::Array toProtoArray(const std::shared_ptr<arrow::ChunkedArray>& chunked,
                                          const ArrowConversionConfig& config);
    static std::shared_ptr<arrow::ChunkedArray> fromProtoChunkedArray(const epoch_proto::Array& proto);

    // Table conversions
    static epoch_proto::Table toProtoTable(const std::shared_ptr<arrow::Table>& table);
    static epoch_proto::Table toProtoTable(const std::shared_ptr<arrow::Table>& table,
                                          const ArrowConversionConfig& config);
    static std::shared_ptr<arrow::Table> fromProtoTable(const epoch_proto::Table& proto);

    // RecordBatch conversions
    static epoch_proto::Table toProtoTable(const std::shared_ptr<arrow::RecordBatch>& batch);
    static std::shared_ptr<arrow::RecordBatch> toRecordBatch(const epoch_proto::Table& proto);

    // Schema conversions
    static std::vector<epoch_proto::ColumnDef> toProtoColumns(const std::shared_ptr<arrow::Schema>& schema);
    static std::shared_ptr<arrow::Schema> fromProtoColumns(const std::vector<epoch_proto::ColumnDef>& columns);

    // DataType conversions
    static epoch_proto::EpochFolioType toProtoType(const std::shared_ptr<arrow::DataType>& type);
    static std::shared_ptr<arrow::DataType> fromProtoType(const epoch_proto::EpochFolioType& proto);

    // Field conversions
    static epoch_proto::ColumnDef toProtoField(const std::shared_ptr<arrow::Field>& field);
    static std::shared_ptr<arrow::Field> fromProtoField(const epoch_proto::ColumnDef& proto);

    // Specialized array conversions
    static epoch_proto::Array toProtoNumericArray(const std::shared_ptr<arrow::Array>& array);
    static epoch_proto::Array toProtoStringArray(const std::shared_ptr<arrow::Array>& array);
    static epoch_proto::Array toProtoDateArray(const std::shared_ptr<arrow::Array>& array);
    static epoch_proto::Array toProtoBoolArray(const std::shared_ptr<arrow::Array>& array);

    // Complex type conversions
    static epoch_proto::Array toProtoStructArray(const std::shared_ptr<arrow::StructArray>& array);
    static epoch_proto::Array toProtoListArray(const std::shared_ptr<arrow::ListArray>& array);
    static epoch_proto::Array toProtoMapArray(const std::shared_ptr<arrow::MapArray>& array);

    // Chart data conversions
    static epoch_proto::Line toLine(const std::shared_ptr<arrow::Array>& xArray,
                                           const std::shared_ptr<arrow::Array>& yArray,
                                           const std::string& name = "");

    static epoch_proto::Chart toScatterChart(const std::shared_ptr<arrow::Array>& xArray,
                                            const std::shared_ptr<arrow::Array>& yArray,
                                            const std::string& title = "");

    static epoch_proto::Chart toBarChart(const std::shared_ptr<arrow::Array>& categories,
                                        const std::shared_ptr<arrow::Array>& values,
                                        const std::string& title = "");

    static epoch_proto::Chart toHistogram(const std::shared_ptr<arrow::Array>& values,
                                         const std::string& title = "",
                                         int bins = 30);

    // Table to chart conversions
    static epoch_proto::Chart tableToLineChart(const std::shared_ptr<arrow::Table>& table,
                                              const std::string& xColumn,
                                              const std::vector<std::string>& yColumns,
                                              const std::string& title = "");

    static epoch_proto::Chart tableToHeatmap(const std::shared_ptr<arrow::Table>& table,
                                            const std::string& title = "");

    // Utility methods
    static bool isNumericType(const std::shared_ptr<arrow::DataType>& type);
    static bool isTemporalType(const std::shared_ptr<arrow::DataType>& type);
    static bool isStringType(const std::shared_ptr<arrow::DataType>& type);

    static std::vector<std::string> getColumnNames(const std::shared_ptr<arrow::Table>& table);
    static std::vector<std::string> getNumericColumnNames(const std::shared_ptr<arrow::Table>& table);

    // Null handling
    static epoch_proto::Scalar nullValueForType(const std::shared_ptr<arrow::DataType>& type);
    static int64_t countNulls(const std::shared_ptr<arrow::Array>& array);
    static std::shared_ptr<arrow::Array> dropNulls(const std::shared_ptr<arrow::Array>& array);

    // Type casting
    static std::shared_ptr<arrow::Array> castArray(const std::shared_ptr<arrow::Array>& array,
                                                  const std::shared_ptr<arrow::DataType>& targetType);

    // Slicing and filtering
    static std::shared_ptr<arrow::Table> sliceTable(const std::shared_ptr<arrow::Table>& table,
                                                   int64_t offset, int64_t length);

    static std::shared_ptr<arrow::Table> selectColumns(const std::shared_ptr<arrow::Table>& table,
                                                      const std::vector<std::string>& columns);

    // Aggregations
    static epoch_proto::Scalar sum(const std::shared_ptr<arrow::Array>& array);
    static epoch_proto::Scalar mean(const std::shared_ptr<arrow::Array>& array);
    static epoch_proto::Scalar min(const std::shared_ptr<arrow::Array>& array);
    static epoch_proto::Scalar max(const std::shared_ptr<arrow::Array>& array);
    static epoch_proto::Scalar count(const std::shared_ptr<arrow::Array>& array);

    // Memory pool configuration
    static void setMemoryPool(arrow::MemoryPool* pool);
    static arrow::MemoryPool* getMemoryPool();

private:
    static arrow::MemoryPool* memory_pool_;

    // Internal conversion helpers
    template<typename ArrowType, typename ProtoType>
    static void convertNumericArray(const std::shared_ptr<arrow::Array>& array,
                                   epoch_proto::Array& proto);

    static void handleNullValues(const std::shared_ptr<arrow::Array>& array,
                                epoch_proto::Array& proto,
                                const ArrowConversionConfig& config);

    static epoch_proto::Scalar extractScalarValue(const std::shared_ptr<arrow::Array>& array,
                                                 int64_t index);

    // Type mapping
    static std::shared_ptr<arrow::DataType> mapProtoTypeToArrow(epoch_proto::EpochFolioType type);
    static epoch_proto::EpochFolioType mapArrowTypeToProto(const std::shared_ptr<arrow::DataType>& type);
};

// Helper namespace for quick Arrow conversions
namespace arrow_conv {
    inline epoch_proto::Array toArray(const std::shared_ptr<arrow::Array>& arr) {
        return ArrowConverter::toProtoArray(arr);
    }

    inline epoch_proto::Array toArray(const std::shared_ptr<arrow::ChunkedArray>& chunked) {
        return ArrowConverter::toProtoArray(chunked);
    }

    inline epoch_proto::Table toTable(const std::shared_ptr<arrow::Table>& table) {
        return ArrowConverter::toProtoTable(table);
    }

    inline epoch_proto::Scalar toScalar(const std::shared_ptr<arrow::Scalar>& scalar) {
        return ArrowConverter::toProtoScalar(scalar);
    }

    inline bool isNumeric(const std::shared_ptr<arrow::DataType>& type) {
        return ArrowConverter::isNumericType(type);
    }

    inline bool isTemporal(const std::shared_ptr<arrow::DataType>& type) {
        return ArrowConverter::isTemporalType(type);
    }
}

} // namespace epoch_tearsheet