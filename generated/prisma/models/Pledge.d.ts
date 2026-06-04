import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.ts";
import type * as Prisma from "../internal/prismaNamespace.ts";
/**
 * Model Pledge
 *
 */
export type PledgeModel = runtime.Types.Result.DefaultSelection<Prisma.$PledgePayload>;
export type AggregatePledge = {
    _count: PledgeCountAggregateOutputType | null;
    _avg: PledgeAvgAggregateOutputType | null;
    _sum: PledgeSumAggregateOutputType | null;
    _min: PledgeMinAggregateOutputType | null;
    _max: PledgeMaxAggregateOutputType | null;
};
export type PledgeAvgAggregateOutputType = {
    amount: runtime.Decimal | null;
};
export type PledgeSumAggregateOutputType = {
    amount: runtime.Decimal | null;
};
export type PledgeMinAggregateOutputType = {
    id: string | null;
    userId: string | null;
    propertyId: string | null;
    amount: runtime.Decimal | null;
    status: $Enums.PledgeStatus | null;
    adminNote: string | null;
    confirmedAt: Date | null;
    createdAt: Date | null;
};
export type PledgeMaxAggregateOutputType = {
    id: string | null;
    userId: string | null;
    propertyId: string | null;
    amount: runtime.Decimal | null;
    status: $Enums.PledgeStatus | null;
    adminNote: string | null;
    confirmedAt: Date | null;
    createdAt: Date | null;
};
export type PledgeCountAggregateOutputType = {
    id: number;
    userId: number;
    propertyId: number;
    amount: number;
    status: number;
    adminNote: number;
    confirmedAt: number;
    createdAt: number;
    _all: number;
};
export type PledgeAvgAggregateInputType = {
    amount?: true;
};
export type PledgeSumAggregateInputType = {
    amount?: true;
};
export type PledgeMinAggregateInputType = {
    id?: true;
    userId?: true;
    propertyId?: true;
    amount?: true;
    status?: true;
    adminNote?: true;
    confirmedAt?: true;
    createdAt?: true;
};
export type PledgeMaxAggregateInputType = {
    id?: true;
    userId?: true;
    propertyId?: true;
    amount?: true;
    status?: true;
    adminNote?: true;
    confirmedAt?: true;
    createdAt?: true;
};
export type PledgeCountAggregateInputType = {
    id?: true;
    userId?: true;
    propertyId?: true;
    amount?: true;
    status?: true;
    adminNote?: true;
    confirmedAt?: true;
    createdAt?: true;
    _all?: true;
};
export type PledgeAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Pledge to aggregate.
     */
    where?: Prisma.PledgeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pledges to fetch.
     */
    orderBy?: Prisma.PledgeOrderByWithRelationInput | Prisma.PledgeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.PledgeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pledges from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pledges.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned Pledges
    **/
    _count?: true | PledgeCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: PledgeAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: PledgeSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: PledgeMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: PledgeMaxAggregateInputType;
};
export type GetPledgeAggregateType<T extends PledgeAggregateArgs> = {
    [P in keyof T & keyof AggregatePledge]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregatePledge[P]> : Prisma.GetScalarType<T[P], AggregatePledge[P]>;
};
export type PledgeGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PledgeWhereInput;
    orderBy?: Prisma.PledgeOrderByWithAggregationInput | Prisma.PledgeOrderByWithAggregationInput[];
    by: Prisma.PledgeScalarFieldEnum[] | Prisma.PledgeScalarFieldEnum;
    having?: Prisma.PledgeScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: PledgeCountAggregateInputType | true;
    _avg?: PledgeAvgAggregateInputType;
    _sum?: PledgeSumAggregateInputType;
    _min?: PledgeMinAggregateInputType;
    _max?: PledgeMaxAggregateInputType;
};
export type PledgeGroupByOutputType = {
    id: string;
    userId: string;
    propertyId: string;
    amount: runtime.Decimal;
    status: $Enums.PledgeStatus;
    adminNote: string | null;
    confirmedAt: Date | null;
    createdAt: Date;
    _count: PledgeCountAggregateOutputType | null;
    _avg: PledgeAvgAggregateOutputType | null;
    _sum: PledgeSumAggregateOutputType | null;
    _min: PledgeMinAggregateOutputType | null;
    _max: PledgeMaxAggregateOutputType | null;
};
export type GetPledgeGroupByPayload<T extends PledgeGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<PledgeGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof PledgeGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], PledgeGroupByOutputType[P]> : Prisma.GetScalarType<T[P], PledgeGroupByOutputType[P]>;
}>>;
export type PledgeWhereInput = {
    AND?: Prisma.PledgeWhereInput | Prisma.PledgeWhereInput[];
    OR?: Prisma.PledgeWhereInput[];
    NOT?: Prisma.PledgeWhereInput | Prisma.PledgeWhereInput[];
    id?: Prisma.UuidFilter<"Pledge"> | string;
    userId?: Prisma.UuidFilter<"Pledge"> | string;
    propertyId?: Prisma.UuidFilter<"Pledge"> | string;
    amount?: Prisma.DecimalFilter<"Pledge"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFilter<"Pledge"> | $Enums.PledgeStatus;
    adminNote?: Prisma.StringNullableFilter<"Pledge"> | string | null;
    confirmedAt?: Prisma.DateTimeNullableFilter<"Pledge"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Pledge"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    property?: Prisma.XOR<Prisma.PropertyScalarRelationFilter, Prisma.PropertyWhereInput>;
    payments?: Prisma.PaymentListRelationFilter;
    documents?: Prisma.DocumentListRelationFilter;
    distributionLines?: Prisma.DistributionLineListRelationFilter;
};
export type PledgeOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    adminNote?: Prisma.SortOrderInput | Prisma.SortOrder;
    confirmedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    user?: Prisma.UserOrderByWithRelationInput;
    property?: Prisma.PropertyOrderByWithRelationInput;
    payments?: Prisma.PaymentOrderByRelationAggregateInput;
    documents?: Prisma.DocumentOrderByRelationAggregateInput;
    distributionLines?: Prisma.DistributionLineOrderByRelationAggregateInput;
};
export type PledgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.PledgeWhereInput | Prisma.PledgeWhereInput[];
    OR?: Prisma.PledgeWhereInput[];
    NOT?: Prisma.PledgeWhereInput | Prisma.PledgeWhereInput[];
    userId?: Prisma.UuidFilter<"Pledge"> | string;
    propertyId?: Prisma.UuidFilter<"Pledge"> | string;
    amount?: Prisma.DecimalFilter<"Pledge"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFilter<"Pledge"> | $Enums.PledgeStatus;
    adminNote?: Prisma.StringNullableFilter<"Pledge"> | string | null;
    confirmedAt?: Prisma.DateTimeNullableFilter<"Pledge"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Pledge"> | Date | string;
    user?: Prisma.XOR<Prisma.UserScalarRelationFilter, Prisma.UserWhereInput>;
    property?: Prisma.XOR<Prisma.PropertyScalarRelationFilter, Prisma.PropertyWhereInput>;
    payments?: Prisma.PaymentListRelationFilter;
    documents?: Prisma.DocumentListRelationFilter;
    distributionLines?: Prisma.DistributionLineListRelationFilter;
}, "id">;
export type PledgeOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    adminNote?: Prisma.SortOrderInput | Prisma.SortOrder;
    confirmedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.PledgeCountOrderByAggregateInput;
    _avg?: Prisma.PledgeAvgOrderByAggregateInput;
    _max?: Prisma.PledgeMaxOrderByAggregateInput;
    _min?: Prisma.PledgeMinOrderByAggregateInput;
    _sum?: Prisma.PledgeSumOrderByAggregateInput;
};
export type PledgeScalarWhereWithAggregatesInput = {
    AND?: Prisma.PledgeScalarWhereWithAggregatesInput | Prisma.PledgeScalarWhereWithAggregatesInput[];
    OR?: Prisma.PledgeScalarWhereWithAggregatesInput[];
    NOT?: Prisma.PledgeScalarWhereWithAggregatesInput | Prisma.PledgeScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Pledge"> | string;
    userId?: Prisma.UuidWithAggregatesFilter<"Pledge"> | string;
    propertyId?: Prisma.UuidWithAggregatesFilter<"Pledge"> | string;
    amount?: Prisma.DecimalWithAggregatesFilter<"Pledge"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusWithAggregatesFilter<"Pledge"> | $Enums.PledgeStatus;
    adminNote?: Prisma.StringNullableWithAggregatesFilter<"Pledge"> | string | null;
    confirmedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Pledge"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Pledge"> | Date | string;
};
export type PledgeCreateInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutPledgesInput;
    property: Prisma.PropertyCreateNestedOneWithoutPledgesInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPledgeInput;
    documents?: Prisma.DocumentCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineCreateNestedManyWithoutPledgeInput;
};
export type PledgeUncheckedCreateInput = {
    id?: string;
    userId: string;
    propertyId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPledgeInput;
    documents?: Prisma.DocumentUncheckedCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineUncheckedCreateNestedManyWithoutPledgeInput;
};
export type PledgeUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutPledgesNestedInput;
    property?: Prisma.PropertyUpdateOneRequiredWithoutPledgesNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPledgeNestedInput;
    documents?: Prisma.DocumentUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUpdateManyWithoutPledgeNestedInput;
};
export type PledgeUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPledgeNestedInput;
    documents?: Prisma.DocumentUncheckedUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUncheckedUpdateManyWithoutPledgeNestedInput;
};
export type PledgeCreateManyInput = {
    id?: string;
    userId: string;
    propertyId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
};
export type PledgeUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PledgeUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PledgeListRelationFilter = {
    every?: Prisma.PledgeWhereInput;
    some?: Prisma.PledgeWhereInput;
    none?: Prisma.PledgeWhereInput;
};
export type PledgeOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type PledgeCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    adminNote?: Prisma.SortOrder;
    confirmedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PledgeAvgOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
};
export type PledgeMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    adminNote?: Prisma.SortOrder;
    confirmedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PledgeMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    userId?: Prisma.SortOrder;
    propertyId?: Prisma.SortOrder;
    amount?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    adminNote?: Prisma.SortOrder;
    confirmedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type PledgeSumOrderByAggregateInput = {
    amount?: Prisma.SortOrder;
};
export type PledgeScalarRelationFilter = {
    is?: Prisma.PledgeWhereInput;
    isNot?: Prisma.PledgeWhereInput;
};
export type PledgeNullableScalarRelationFilter = {
    is?: Prisma.PledgeWhereInput | null;
    isNot?: Prisma.PledgeWhereInput | null;
};
export type PledgeCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutUserInput, Prisma.PledgeUncheckedCreateWithoutUserInput> | Prisma.PledgeCreateWithoutUserInput[] | Prisma.PledgeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutUserInput | Prisma.PledgeCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.PledgeCreateManyUserInputEnvelope;
    connect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
};
export type PledgeUncheckedCreateNestedManyWithoutUserInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutUserInput, Prisma.PledgeUncheckedCreateWithoutUserInput> | Prisma.PledgeCreateWithoutUserInput[] | Prisma.PledgeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutUserInput | Prisma.PledgeCreateOrConnectWithoutUserInput[];
    createMany?: Prisma.PledgeCreateManyUserInputEnvelope;
    connect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
};
export type PledgeUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutUserInput, Prisma.PledgeUncheckedCreateWithoutUserInput> | Prisma.PledgeCreateWithoutUserInput[] | Prisma.PledgeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutUserInput | Prisma.PledgeCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.PledgeUpsertWithWhereUniqueWithoutUserInput | Prisma.PledgeUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.PledgeCreateManyUserInputEnvelope;
    set?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    disconnect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    delete?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    connect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    update?: Prisma.PledgeUpdateWithWhereUniqueWithoutUserInput | Prisma.PledgeUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.PledgeUpdateManyWithWhereWithoutUserInput | Prisma.PledgeUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.PledgeScalarWhereInput | Prisma.PledgeScalarWhereInput[];
};
export type PledgeUncheckedUpdateManyWithoutUserNestedInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutUserInput, Prisma.PledgeUncheckedCreateWithoutUserInput> | Prisma.PledgeCreateWithoutUserInput[] | Prisma.PledgeUncheckedCreateWithoutUserInput[];
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutUserInput | Prisma.PledgeCreateOrConnectWithoutUserInput[];
    upsert?: Prisma.PledgeUpsertWithWhereUniqueWithoutUserInput | Prisma.PledgeUpsertWithWhereUniqueWithoutUserInput[];
    createMany?: Prisma.PledgeCreateManyUserInputEnvelope;
    set?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    disconnect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    delete?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    connect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    update?: Prisma.PledgeUpdateWithWhereUniqueWithoutUserInput | Prisma.PledgeUpdateWithWhereUniqueWithoutUserInput[];
    updateMany?: Prisma.PledgeUpdateManyWithWhereWithoutUserInput | Prisma.PledgeUpdateManyWithWhereWithoutUserInput[];
    deleteMany?: Prisma.PledgeScalarWhereInput | Prisma.PledgeScalarWhereInput[];
};
export type PledgeCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutPropertyInput, Prisma.PledgeUncheckedCreateWithoutPropertyInput> | Prisma.PledgeCreateWithoutPropertyInput[] | Prisma.PledgeUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutPropertyInput | Prisma.PledgeCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.PledgeCreateManyPropertyInputEnvelope;
    connect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
};
export type PledgeUncheckedCreateNestedManyWithoutPropertyInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutPropertyInput, Prisma.PledgeUncheckedCreateWithoutPropertyInput> | Prisma.PledgeCreateWithoutPropertyInput[] | Prisma.PledgeUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutPropertyInput | Prisma.PledgeCreateOrConnectWithoutPropertyInput[];
    createMany?: Prisma.PledgeCreateManyPropertyInputEnvelope;
    connect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
};
export type PledgeUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutPropertyInput, Prisma.PledgeUncheckedCreateWithoutPropertyInput> | Prisma.PledgeCreateWithoutPropertyInput[] | Prisma.PledgeUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutPropertyInput | Prisma.PledgeCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.PledgeUpsertWithWhereUniqueWithoutPropertyInput | Prisma.PledgeUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.PledgeCreateManyPropertyInputEnvelope;
    set?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    disconnect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    delete?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    connect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    update?: Prisma.PledgeUpdateWithWhereUniqueWithoutPropertyInput | Prisma.PledgeUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.PledgeUpdateManyWithWhereWithoutPropertyInput | Prisma.PledgeUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.PledgeScalarWhereInput | Prisma.PledgeScalarWhereInput[];
};
export type PledgeUncheckedUpdateManyWithoutPropertyNestedInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutPropertyInput, Prisma.PledgeUncheckedCreateWithoutPropertyInput> | Prisma.PledgeCreateWithoutPropertyInput[] | Prisma.PledgeUncheckedCreateWithoutPropertyInput[];
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutPropertyInput | Prisma.PledgeCreateOrConnectWithoutPropertyInput[];
    upsert?: Prisma.PledgeUpsertWithWhereUniqueWithoutPropertyInput | Prisma.PledgeUpsertWithWhereUniqueWithoutPropertyInput[];
    createMany?: Prisma.PledgeCreateManyPropertyInputEnvelope;
    set?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    disconnect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    delete?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    connect?: Prisma.PledgeWhereUniqueInput | Prisma.PledgeWhereUniqueInput[];
    update?: Prisma.PledgeUpdateWithWhereUniqueWithoutPropertyInput | Prisma.PledgeUpdateWithWhereUniqueWithoutPropertyInput[];
    updateMany?: Prisma.PledgeUpdateManyWithWhereWithoutPropertyInput | Prisma.PledgeUpdateManyWithWhereWithoutPropertyInput[];
    deleteMany?: Prisma.PledgeScalarWhereInput | Prisma.PledgeScalarWhereInput[];
};
export type EnumPledgeStatusFieldUpdateOperationsInput = {
    set?: $Enums.PledgeStatus;
};
export type PledgeCreateNestedOneWithoutPaymentsInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutPaymentsInput, Prisma.PledgeUncheckedCreateWithoutPaymentsInput>;
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutPaymentsInput;
    connect?: Prisma.PledgeWhereUniqueInput;
};
export type PledgeUpdateOneRequiredWithoutPaymentsNestedInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutPaymentsInput, Prisma.PledgeUncheckedCreateWithoutPaymentsInput>;
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutPaymentsInput;
    upsert?: Prisma.PledgeUpsertWithoutPaymentsInput;
    connect?: Prisma.PledgeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PledgeUpdateToOneWithWhereWithoutPaymentsInput, Prisma.PledgeUpdateWithoutPaymentsInput>, Prisma.PledgeUncheckedUpdateWithoutPaymentsInput>;
};
export type PledgeCreateNestedOneWithoutDocumentsInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutDocumentsInput, Prisma.PledgeUncheckedCreateWithoutDocumentsInput>;
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutDocumentsInput;
    connect?: Prisma.PledgeWhereUniqueInput;
};
export type PledgeUpdateOneWithoutDocumentsNestedInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutDocumentsInput, Prisma.PledgeUncheckedCreateWithoutDocumentsInput>;
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutDocumentsInput;
    upsert?: Prisma.PledgeUpsertWithoutDocumentsInput;
    disconnect?: Prisma.PledgeWhereInput | boolean;
    delete?: Prisma.PledgeWhereInput | boolean;
    connect?: Prisma.PledgeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PledgeUpdateToOneWithWhereWithoutDocumentsInput, Prisma.PledgeUpdateWithoutDocumentsInput>, Prisma.PledgeUncheckedUpdateWithoutDocumentsInput>;
};
export type PledgeCreateNestedOneWithoutDistributionLinesInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutDistributionLinesInput, Prisma.PledgeUncheckedCreateWithoutDistributionLinesInput>;
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutDistributionLinesInput;
    connect?: Prisma.PledgeWhereUniqueInput;
};
export type PledgeUpdateOneRequiredWithoutDistributionLinesNestedInput = {
    create?: Prisma.XOR<Prisma.PledgeCreateWithoutDistributionLinesInput, Prisma.PledgeUncheckedCreateWithoutDistributionLinesInput>;
    connectOrCreate?: Prisma.PledgeCreateOrConnectWithoutDistributionLinesInput;
    upsert?: Prisma.PledgeUpsertWithoutDistributionLinesInput;
    connect?: Prisma.PledgeWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.PledgeUpdateToOneWithWhereWithoutDistributionLinesInput, Prisma.PledgeUpdateWithoutDistributionLinesInput>, Prisma.PledgeUncheckedUpdateWithoutDistributionLinesInput>;
};
export type PledgeCreateWithoutUserInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    property: Prisma.PropertyCreateNestedOneWithoutPledgesInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPledgeInput;
    documents?: Prisma.DocumentCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineCreateNestedManyWithoutPledgeInput;
};
export type PledgeUncheckedCreateWithoutUserInput = {
    id?: string;
    propertyId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPledgeInput;
    documents?: Prisma.DocumentUncheckedCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineUncheckedCreateNestedManyWithoutPledgeInput;
};
export type PledgeCreateOrConnectWithoutUserInput = {
    where: Prisma.PledgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutUserInput, Prisma.PledgeUncheckedCreateWithoutUserInput>;
};
export type PledgeCreateManyUserInputEnvelope = {
    data: Prisma.PledgeCreateManyUserInput | Prisma.PledgeCreateManyUserInput[];
    skipDuplicates?: boolean;
};
export type PledgeUpsertWithWhereUniqueWithoutUserInput = {
    where: Prisma.PledgeWhereUniqueInput;
    update: Prisma.XOR<Prisma.PledgeUpdateWithoutUserInput, Prisma.PledgeUncheckedUpdateWithoutUserInput>;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutUserInput, Prisma.PledgeUncheckedCreateWithoutUserInput>;
};
export type PledgeUpdateWithWhereUniqueWithoutUserInput = {
    where: Prisma.PledgeWhereUniqueInput;
    data: Prisma.XOR<Prisma.PledgeUpdateWithoutUserInput, Prisma.PledgeUncheckedUpdateWithoutUserInput>;
};
export type PledgeUpdateManyWithWhereWithoutUserInput = {
    where: Prisma.PledgeScalarWhereInput;
    data: Prisma.XOR<Prisma.PledgeUpdateManyMutationInput, Prisma.PledgeUncheckedUpdateManyWithoutUserInput>;
};
export type PledgeScalarWhereInput = {
    AND?: Prisma.PledgeScalarWhereInput | Prisma.PledgeScalarWhereInput[];
    OR?: Prisma.PledgeScalarWhereInput[];
    NOT?: Prisma.PledgeScalarWhereInput | Prisma.PledgeScalarWhereInput[];
    id?: Prisma.UuidFilter<"Pledge"> | string;
    userId?: Prisma.UuidFilter<"Pledge"> | string;
    propertyId?: Prisma.UuidFilter<"Pledge"> | string;
    amount?: Prisma.DecimalFilter<"Pledge"> | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFilter<"Pledge"> | $Enums.PledgeStatus;
    adminNote?: Prisma.StringNullableFilter<"Pledge"> | string | null;
    confirmedAt?: Prisma.DateTimeNullableFilter<"Pledge"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Pledge"> | Date | string;
};
export type PledgeCreateWithoutPropertyInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutPledgesInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPledgeInput;
    documents?: Prisma.DocumentCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineCreateNestedManyWithoutPledgeInput;
};
export type PledgeUncheckedCreateWithoutPropertyInput = {
    id?: string;
    userId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPledgeInput;
    documents?: Prisma.DocumentUncheckedCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineUncheckedCreateNestedManyWithoutPledgeInput;
};
export type PledgeCreateOrConnectWithoutPropertyInput = {
    where: Prisma.PledgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutPropertyInput, Prisma.PledgeUncheckedCreateWithoutPropertyInput>;
};
export type PledgeCreateManyPropertyInputEnvelope = {
    data: Prisma.PledgeCreateManyPropertyInput | Prisma.PledgeCreateManyPropertyInput[];
    skipDuplicates?: boolean;
};
export type PledgeUpsertWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.PledgeWhereUniqueInput;
    update: Prisma.XOR<Prisma.PledgeUpdateWithoutPropertyInput, Prisma.PledgeUncheckedUpdateWithoutPropertyInput>;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutPropertyInput, Prisma.PledgeUncheckedCreateWithoutPropertyInput>;
};
export type PledgeUpdateWithWhereUniqueWithoutPropertyInput = {
    where: Prisma.PledgeWhereUniqueInput;
    data: Prisma.XOR<Prisma.PledgeUpdateWithoutPropertyInput, Prisma.PledgeUncheckedUpdateWithoutPropertyInput>;
};
export type PledgeUpdateManyWithWhereWithoutPropertyInput = {
    where: Prisma.PledgeScalarWhereInput;
    data: Prisma.XOR<Prisma.PledgeUpdateManyMutationInput, Prisma.PledgeUncheckedUpdateManyWithoutPropertyInput>;
};
export type PledgeCreateWithoutPaymentsInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutPledgesInput;
    property: Prisma.PropertyCreateNestedOneWithoutPledgesInput;
    documents?: Prisma.DocumentCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineCreateNestedManyWithoutPledgeInput;
};
export type PledgeUncheckedCreateWithoutPaymentsInput = {
    id?: string;
    userId: string;
    propertyId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    documents?: Prisma.DocumentUncheckedCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineUncheckedCreateNestedManyWithoutPledgeInput;
};
export type PledgeCreateOrConnectWithoutPaymentsInput = {
    where: Prisma.PledgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutPaymentsInput, Prisma.PledgeUncheckedCreateWithoutPaymentsInput>;
};
export type PledgeUpsertWithoutPaymentsInput = {
    update: Prisma.XOR<Prisma.PledgeUpdateWithoutPaymentsInput, Prisma.PledgeUncheckedUpdateWithoutPaymentsInput>;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutPaymentsInput, Prisma.PledgeUncheckedCreateWithoutPaymentsInput>;
    where?: Prisma.PledgeWhereInput;
};
export type PledgeUpdateToOneWithWhereWithoutPaymentsInput = {
    where?: Prisma.PledgeWhereInput;
    data: Prisma.XOR<Prisma.PledgeUpdateWithoutPaymentsInput, Prisma.PledgeUncheckedUpdateWithoutPaymentsInput>;
};
export type PledgeUpdateWithoutPaymentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutPledgesNestedInput;
    property?: Prisma.PropertyUpdateOneRequiredWithoutPledgesNestedInput;
    documents?: Prisma.DocumentUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUpdateManyWithoutPledgeNestedInput;
};
export type PledgeUncheckedUpdateWithoutPaymentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    documents?: Prisma.DocumentUncheckedUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUncheckedUpdateManyWithoutPledgeNestedInput;
};
export type PledgeCreateWithoutDocumentsInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutPledgesInput;
    property: Prisma.PropertyCreateNestedOneWithoutPledgesInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineCreateNestedManyWithoutPledgeInput;
};
export type PledgeUncheckedCreateWithoutDocumentsInput = {
    id?: string;
    userId: string;
    propertyId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPledgeInput;
    distributionLines?: Prisma.DistributionLineUncheckedCreateNestedManyWithoutPledgeInput;
};
export type PledgeCreateOrConnectWithoutDocumentsInput = {
    where: Prisma.PledgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutDocumentsInput, Prisma.PledgeUncheckedCreateWithoutDocumentsInput>;
};
export type PledgeUpsertWithoutDocumentsInput = {
    update: Prisma.XOR<Prisma.PledgeUpdateWithoutDocumentsInput, Prisma.PledgeUncheckedUpdateWithoutDocumentsInput>;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutDocumentsInput, Prisma.PledgeUncheckedCreateWithoutDocumentsInput>;
    where?: Prisma.PledgeWhereInput;
};
export type PledgeUpdateToOneWithWhereWithoutDocumentsInput = {
    where?: Prisma.PledgeWhereInput;
    data: Prisma.XOR<Prisma.PledgeUpdateWithoutDocumentsInput, Prisma.PledgeUncheckedUpdateWithoutDocumentsInput>;
};
export type PledgeUpdateWithoutDocumentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutPledgesNestedInput;
    property?: Prisma.PropertyUpdateOneRequiredWithoutPledgesNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUpdateManyWithoutPledgeNestedInput;
};
export type PledgeUncheckedUpdateWithoutDocumentsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUncheckedUpdateManyWithoutPledgeNestedInput;
};
export type PledgeCreateWithoutDistributionLinesInput = {
    id?: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    user: Prisma.UserCreateNestedOneWithoutPledgesInput;
    property: Prisma.PropertyCreateNestedOneWithoutPledgesInput;
    payments?: Prisma.PaymentCreateNestedManyWithoutPledgeInput;
    documents?: Prisma.DocumentCreateNestedManyWithoutPledgeInput;
};
export type PledgeUncheckedCreateWithoutDistributionLinesInput = {
    id?: string;
    userId: string;
    propertyId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
    payments?: Prisma.PaymentUncheckedCreateNestedManyWithoutPledgeInput;
    documents?: Prisma.DocumentUncheckedCreateNestedManyWithoutPledgeInput;
};
export type PledgeCreateOrConnectWithoutDistributionLinesInput = {
    where: Prisma.PledgeWhereUniqueInput;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutDistributionLinesInput, Prisma.PledgeUncheckedCreateWithoutDistributionLinesInput>;
};
export type PledgeUpsertWithoutDistributionLinesInput = {
    update: Prisma.XOR<Prisma.PledgeUpdateWithoutDistributionLinesInput, Prisma.PledgeUncheckedUpdateWithoutDistributionLinesInput>;
    create: Prisma.XOR<Prisma.PledgeCreateWithoutDistributionLinesInput, Prisma.PledgeUncheckedCreateWithoutDistributionLinesInput>;
    where?: Prisma.PledgeWhereInput;
};
export type PledgeUpdateToOneWithWhereWithoutDistributionLinesInput = {
    where?: Prisma.PledgeWhereInput;
    data: Prisma.XOR<Prisma.PledgeUpdateWithoutDistributionLinesInput, Prisma.PledgeUncheckedUpdateWithoutDistributionLinesInput>;
};
export type PledgeUpdateWithoutDistributionLinesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutPledgesNestedInput;
    property?: Prisma.PropertyUpdateOneRequiredWithoutPledgesNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPledgeNestedInput;
    documents?: Prisma.DocumentUpdateManyWithoutPledgeNestedInput;
};
export type PledgeUncheckedUpdateWithoutDistributionLinesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPledgeNestedInput;
    documents?: Prisma.DocumentUncheckedUpdateManyWithoutPledgeNestedInput;
};
export type PledgeCreateManyUserInput = {
    id?: string;
    propertyId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
};
export type PledgeUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    property?: Prisma.PropertyUpdateOneRequiredWithoutPledgesNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPledgeNestedInput;
    documents?: Prisma.DocumentUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUpdateManyWithoutPledgeNestedInput;
};
export type PledgeUncheckedUpdateWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPledgeNestedInput;
    documents?: Prisma.DocumentUncheckedUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUncheckedUpdateManyWithoutPledgeNestedInput;
};
export type PledgeUncheckedUpdateManyWithoutUserInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    propertyId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type PledgeCreateManyPropertyInput = {
    id?: string;
    userId: string;
    amount: runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: $Enums.PledgeStatus;
    adminNote?: string | null;
    confirmedAt?: Date | string | null;
    createdAt?: Date | string;
};
export type PledgeUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    user?: Prisma.UserUpdateOneRequiredWithoutPledgesNestedInput;
    payments?: Prisma.PaymentUpdateManyWithoutPledgeNestedInput;
    documents?: Prisma.DocumentUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUpdateManyWithoutPledgeNestedInput;
};
export type PledgeUncheckedUpdateWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    payments?: Prisma.PaymentUncheckedUpdateManyWithoutPledgeNestedInput;
    documents?: Prisma.DocumentUncheckedUpdateManyWithoutPledgeNestedInput;
    distributionLines?: Prisma.DistributionLineUncheckedUpdateManyWithoutPledgeNestedInput;
};
export type PledgeUncheckedUpdateManyWithoutPropertyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    userId?: Prisma.StringFieldUpdateOperationsInput | string;
    amount?: Prisma.DecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string;
    status?: Prisma.EnumPledgeStatusFieldUpdateOperationsInput | $Enums.PledgeStatus;
    adminNote?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    confirmedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
/**
 * Count Type PledgeCountOutputType
 */
export type PledgeCountOutputType = {
    payments: number;
    documents: number;
    distributionLines: number;
};
export type PledgeCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    payments?: boolean | PledgeCountOutputTypeCountPaymentsArgs;
    documents?: boolean | PledgeCountOutputTypeCountDocumentsArgs;
    distributionLines?: boolean | PledgeCountOutputTypeCountDistributionLinesArgs;
};
/**
 * PledgeCountOutputType without action
 */
export type PledgeCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the PledgeCountOutputType
     */
    select?: Prisma.PledgeCountOutputTypeSelect<ExtArgs> | null;
};
/**
 * PledgeCountOutputType without action
 */
export type PledgeCountOutputTypeCountPaymentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.PaymentWhereInput;
};
/**
 * PledgeCountOutputType without action
 */
export type PledgeCountOutputTypeCountDocumentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DocumentWhereInput;
};
/**
 * PledgeCountOutputType without action
 */
export type PledgeCountOutputTypeCountDistributionLinesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DistributionLineWhereInput;
};
export type PledgeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    propertyId?: boolean;
    amount?: boolean;
    status?: boolean;
    adminNote?: boolean;
    confirmedAt?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    payments?: boolean | Prisma.Pledge$paymentsArgs<ExtArgs>;
    documents?: boolean | Prisma.Pledge$documentsArgs<ExtArgs>;
    distributionLines?: boolean | Prisma.Pledge$distributionLinesArgs<ExtArgs>;
    _count?: boolean | Prisma.PledgeCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pledge"]>;
export type PledgeSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    propertyId?: boolean;
    amount?: boolean;
    status?: boolean;
    adminNote?: boolean;
    confirmedAt?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pledge"]>;
export type PledgeSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    userId?: boolean;
    propertyId?: boolean;
    amount?: boolean;
    status?: boolean;
    adminNote?: boolean;
    confirmedAt?: boolean;
    createdAt?: boolean;
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["pledge"]>;
export type PledgeSelectScalar = {
    id?: boolean;
    userId?: boolean;
    propertyId?: boolean;
    amount?: boolean;
    status?: boolean;
    adminNote?: boolean;
    confirmedAt?: boolean;
    createdAt?: boolean;
};
export type PledgeOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "userId" | "propertyId" | "amount" | "status" | "adminNote" | "confirmedAt" | "createdAt", ExtArgs["result"]["pledge"]>;
export type PledgeInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
    payments?: boolean | Prisma.Pledge$paymentsArgs<ExtArgs>;
    documents?: boolean | Prisma.Pledge$documentsArgs<ExtArgs>;
    distributionLines?: boolean | Prisma.Pledge$distributionLinesArgs<ExtArgs>;
    _count?: boolean | Prisma.PledgeCountOutputTypeDefaultArgs<ExtArgs>;
};
export type PledgeIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
};
export type PledgeIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    user?: boolean | Prisma.UserDefaultArgs<ExtArgs>;
    property?: boolean | Prisma.PropertyDefaultArgs<ExtArgs>;
};
export type $PledgePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Pledge";
    objects: {
        user: Prisma.$UserPayload<ExtArgs>;
        property: Prisma.$PropertyPayload<ExtArgs>;
        payments: Prisma.$PaymentPayload<ExtArgs>[];
        documents: Prisma.$DocumentPayload<ExtArgs>[];
        distributionLines: Prisma.$DistributionLinePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        userId: string;
        propertyId: string;
        amount: runtime.Decimal;
        status: $Enums.PledgeStatus;
        adminNote: string | null;
        confirmedAt: Date | null;
        createdAt: Date;
    }, ExtArgs["result"]["pledge"]>;
    composites: {};
};
export type PledgeGetPayload<S extends boolean | null | undefined | PledgeDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$PledgePayload, S>;
export type PledgeCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<PledgeFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: PledgeCountAggregateInputType | true;
};
export interface PledgeDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Pledge'];
        meta: {
            name: 'Pledge';
        };
    };
    /**
     * Find zero or one Pledge that matches the filter.
     * @param {PledgeFindUniqueArgs} args - Arguments to find a Pledge
     * @example
     * // Get one Pledge
     * const pledge = await prisma.pledge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PledgeFindUniqueArgs>(args: Prisma.SelectSubset<T, PledgeFindUniqueArgs<ExtArgs>>): Prisma.Prisma__PledgeClient<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one Pledge that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PledgeFindUniqueOrThrowArgs} args - Arguments to find a Pledge
     * @example
     * // Get one Pledge
     * const pledge = await prisma.pledge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PledgeFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, PledgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__PledgeClient<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Pledge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PledgeFindFirstArgs} args - Arguments to find a Pledge
     * @example
     * // Get one Pledge
     * const pledge = await prisma.pledge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PledgeFindFirstArgs>(args?: Prisma.SelectSubset<T, PledgeFindFirstArgs<ExtArgs>>): Prisma.Prisma__PledgeClient<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first Pledge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PledgeFindFirstOrThrowArgs} args - Arguments to find a Pledge
     * @example
     * // Get one Pledge
     * const pledge = await prisma.pledge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PledgeFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, PledgeFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__PledgeClient<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more Pledges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PledgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pledges
     * const pledges = await prisma.pledge.findMany()
     *
     * // Get first 10 Pledges
     * const pledges = await prisma.pledge.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const pledgeWithIdOnly = await prisma.pledge.findMany({ select: { id: true } })
     *
     */
    findMany<T extends PledgeFindManyArgs>(args?: Prisma.SelectSubset<T, PledgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a Pledge.
     * @param {PledgeCreateArgs} args - Arguments to create a Pledge.
     * @example
     * // Create one Pledge
     * const Pledge = await prisma.pledge.create({
     *   data: {
     *     // ... data to create a Pledge
     *   }
     * })
     *
     */
    create<T extends PledgeCreateArgs>(args: Prisma.SelectSubset<T, PledgeCreateArgs<ExtArgs>>): Prisma.Prisma__PledgeClient<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many Pledges.
     * @param {PledgeCreateManyArgs} args - Arguments to create many Pledges.
     * @example
     * // Create many Pledges
     * const pledge = await prisma.pledge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends PledgeCreateManyArgs>(args?: Prisma.SelectSubset<T, PledgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many Pledges and returns the data saved in the database.
     * @param {PledgeCreateManyAndReturnArgs} args - Arguments to create many Pledges.
     * @example
     * // Create many Pledges
     * const pledge = await prisma.pledge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many Pledges and only return the `id`
     * const pledgeWithIdOnly = await prisma.pledge.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends PledgeCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, PledgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a Pledge.
     * @param {PledgeDeleteArgs} args - Arguments to delete one Pledge.
     * @example
     * // Delete one Pledge
     * const Pledge = await prisma.pledge.delete({
     *   where: {
     *     // ... filter to delete one Pledge
     *   }
     * })
     *
     */
    delete<T extends PledgeDeleteArgs>(args: Prisma.SelectSubset<T, PledgeDeleteArgs<ExtArgs>>): Prisma.Prisma__PledgeClient<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one Pledge.
     * @param {PledgeUpdateArgs} args - Arguments to update one Pledge.
     * @example
     * // Update one Pledge
     * const pledge = await prisma.pledge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends PledgeUpdateArgs>(args: Prisma.SelectSubset<T, PledgeUpdateArgs<ExtArgs>>): Prisma.Prisma__PledgeClient<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more Pledges.
     * @param {PledgeDeleteManyArgs} args - Arguments to filter Pledges to delete.
     * @example
     * // Delete a few Pledges
     * const { count } = await prisma.pledge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends PledgeDeleteManyArgs>(args?: Prisma.SelectSubset<T, PledgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Pledges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PledgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pledges
     * const pledge = await prisma.pledge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends PledgeUpdateManyArgs>(args: Prisma.SelectSubset<T, PledgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more Pledges and returns the data updated in the database.
     * @param {PledgeUpdateManyAndReturnArgs} args - Arguments to update many Pledges.
     * @example
     * // Update many Pledges
     * const pledge = await prisma.pledge.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more Pledges and only return the `id`
     * const pledgeWithIdOnly = await prisma.pledge.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends PledgeUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, PledgeUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one Pledge.
     * @param {PledgeUpsertArgs} args - Arguments to update or create a Pledge.
     * @example
     * // Update or create a Pledge
     * const pledge = await prisma.pledge.upsert({
     *   create: {
     *     // ... data to create a Pledge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Pledge we want to update
     *   }
     * })
     */
    upsert<T extends PledgeUpsertArgs>(args: Prisma.SelectSubset<T, PledgeUpsertArgs<ExtArgs>>): Prisma.Prisma__PledgeClient<runtime.Types.Result.GetResult<Prisma.$PledgePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of Pledges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PledgeCountArgs} args - Arguments to filter Pledges to count.
     * @example
     * // Count the number of Pledges
     * const count = await prisma.pledge.count({
     *   where: {
     *     // ... the filter for the Pledges we want to count
     *   }
     * })
    **/
    count<T extends PledgeCountArgs>(args?: Prisma.Subset<T, PledgeCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], PledgeCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a Pledge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PledgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PledgeAggregateArgs>(args: Prisma.Subset<T, PledgeAggregateArgs>): Prisma.PrismaPromise<GetPledgeAggregateType<T>>;
    /**
     * Group by Pledge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PledgeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends PledgeGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: PledgeGroupByArgs['orderBy'];
    } : {
        orderBy?: PledgeGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, PledgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPledgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the Pledge model
     */
    readonly fields: PledgeFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for Pledge.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__PledgeClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    user<T extends Prisma.UserDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.UserDefaultArgs<ExtArgs>>): Prisma.Prisma__UserClient<runtime.Types.Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    property<T extends Prisma.PropertyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.PropertyDefaultArgs<ExtArgs>>): Prisma.Prisma__PropertyClient<runtime.Types.Result.GetResult<Prisma.$PropertyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    payments<T extends Prisma.Pledge$paymentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Pledge$paymentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$PaymentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    documents<T extends Prisma.Pledge$documentsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Pledge$documentsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DocumentPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    distributionLines<T extends Prisma.Pledge$distributionLinesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Pledge$distributionLinesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DistributionLinePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the Pledge model
 */
export interface PledgeFieldRefs {
    readonly id: Prisma.FieldRef<"Pledge", 'String'>;
    readonly userId: Prisma.FieldRef<"Pledge", 'String'>;
    readonly propertyId: Prisma.FieldRef<"Pledge", 'String'>;
    readonly amount: Prisma.FieldRef<"Pledge", 'Decimal'>;
    readonly status: Prisma.FieldRef<"Pledge", 'PledgeStatus'>;
    readonly adminNote: Prisma.FieldRef<"Pledge", 'String'>;
    readonly confirmedAt: Prisma.FieldRef<"Pledge", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Pledge", 'DateTime'>;
}
/**
 * Pledge findUnique
 */
export type PledgeFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * Filter, which Pledge to fetch.
     */
    where: Prisma.PledgeWhereUniqueInput;
};
/**
 * Pledge findUniqueOrThrow
 */
export type PledgeFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * Filter, which Pledge to fetch.
     */
    where: Prisma.PledgeWhereUniqueInput;
};
/**
 * Pledge findFirst
 */
export type PledgeFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * Filter, which Pledge to fetch.
     */
    where?: Prisma.PledgeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pledges to fetch.
     */
    orderBy?: Prisma.PledgeOrderByWithRelationInput | Prisma.PledgeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Pledges.
     */
    cursor?: Prisma.PledgeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pledges from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pledges.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Pledges.
     */
    distinct?: Prisma.PledgeScalarFieldEnum | Prisma.PledgeScalarFieldEnum[];
};
/**
 * Pledge findFirstOrThrow
 */
export type PledgeFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * Filter, which Pledge to fetch.
     */
    where?: Prisma.PledgeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pledges to fetch.
     */
    orderBy?: Prisma.PledgeOrderByWithRelationInput | Prisma.PledgeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for Pledges.
     */
    cursor?: Prisma.PledgeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pledges from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pledges.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Pledges.
     */
    distinct?: Prisma.PledgeScalarFieldEnum | Prisma.PledgeScalarFieldEnum[];
};
/**
 * Pledge findMany
 */
export type PledgeFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * Filter, which Pledges to fetch.
     */
    where?: Prisma.PledgeWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of Pledges to fetch.
     */
    orderBy?: Prisma.PledgeOrderByWithRelationInput | Prisma.PledgeOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing Pledges.
     */
    cursor?: Prisma.PledgeWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` Pledges from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` Pledges.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of Pledges.
     */
    distinct?: Prisma.PledgeScalarFieldEnum | Prisma.PledgeScalarFieldEnum[];
};
/**
 * Pledge create
 */
export type PledgeCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * The data needed to create a Pledge.
     */
    data: Prisma.XOR<Prisma.PledgeCreateInput, Prisma.PledgeUncheckedCreateInput>;
};
/**
 * Pledge createMany
 */
export type PledgeCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pledges.
     */
    data: Prisma.PledgeCreateManyInput | Prisma.PledgeCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * Pledge createManyAndReturn
 */
export type PledgeCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * The data used to create many Pledges.
     */
    data: Prisma.PledgeCreateManyInput | Prisma.PledgeCreateManyInput[];
    skipDuplicates?: boolean;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeIncludeCreateManyAndReturn<ExtArgs> | null;
};
/**
 * Pledge update
 */
export type PledgeUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * The data needed to update a Pledge.
     */
    data: Prisma.XOR<Prisma.PledgeUpdateInput, Prisma.PledgeUncheckedUpdateInput>;
    /**
     * Choose, which Pledge to update.
     */
    where: Prisma.PledgeWhereUniqueInput;
};
/**
 * Pledge updateMany
 */
export type PledgeUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update Pledges.
     */
    data: Prisma.XOR<Prisma.PledgeUpdateManyMutationInput, Prisma.PledgeUncheckedUpdateManyInput>;
    /**
     * Filter which Pledges to update
     */
    where?: Prisma.PledgeWhereInput;
    /**
     * Limit how many Pledges to update.
     */
    limit?: number;
};
/**
 * Pledge updateManyAndReturn
 */
export type PledgeUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * The data used to update Pledges.
     */
    data: Prisma.XOR<Prisma.PledgeUpdateManyMutationInput, Prisma.PledgeUncheckedUpdateManyInput>;
    /**
     * Filter which Pledges to update
     */
    where?: Prisma.PledgeWhereInput;
    /**
     * Limit how many Pledges to update.
     */
    limit?: number;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeIncludeUpdateManyAndReturn<ExtArgs> | null;
};
/**
 * Pledge upsert
 */
export type PledgeUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * The filter to search for the Pledge to update in case it exists.
     */
    where: Prisma.PledgeWhereUniqueInput;
    /**
     * In case the Pledge found by the `where` argument doesn't exist, create a new Pledge with this data.
     */
    create: Prisma.XOR<Prisma.PledgeCreateInput, Prisma.PledgeUncheckedCreateInput>;
    /**
     * In case the Pledge was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.PledgeUpdateInput, Prisma.PledgeUncheckedUpdateInput>;
};
/**
 * Pledge delete
 */
export type PledgeDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
    /**
     * Filter which Pledge to delete.
     */
    where: Prisma.PledgeWhereUniqueInput;
};
/**
 * Pledge deleteMany
 */
export type PledgeDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which Pledges to delete
     */
    where?: Prisma.PledgeWhereInput;
    /**
     * Limit how many Pledges to delete.
     */
    limit?: number;
};
/**
 * Pledge.payments
 */
export type Pledge$paymentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Payment
     */
    select?: Prisma.PaymentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Payment
     */
    omit?: Prisma.PaymentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PaymentInclude<ExtArgs> | null;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput | Prisma.PaymentOrderByWithRelationInput[];
    cursor?: Prisma.PaymentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.PaymentScalarFieldEnum | Prisma.PaymentScalarFieldEnum[];
};
/**
 * Pledge.documents
 */
export type Pledge$documentsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Document
     */
    select?: Prisma.DocumentSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Document
     */
    omit?: Prisma.DocumentOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DocumentInclude<ExtArgs> | null;
    where?: Prisma.DocumentWhereInput;
    orderBy?: Prisma.DocumentOrderByWithRelationInput | Prisma.DocumentOrderByWithRelationInput[];
    cursor?: Prisma.DocumentWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DocumentScalarFieldEnum | Prisma.DocumentScalarFieldEnum[];
};
/**
 * Pledge.distributionLines
 */
export type Pledge$distributionLinesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DistributionLine
     */
    select?: Prisma.DistributionLineSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the DistributionLine
     */
    omit?: Prisma.DistributionLineOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.DistributionLineInclude<ExtArgs> | null;
    where?: Prisma.DistributionLineWhereInput;
    orderBy?: Prisma.DistributionLineOrderByWithRelationInput | Prisma.DistributionLineOrderByWithRelationInput[];
    cursor?: Prisma.DistributionLineWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DistributionLineScalarFieldEnum | Prisma.DistributionLineScalarFieldEnum[];
};
/**
 * Pledge without action
 */
export type PledgeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Pledge
     */
    select?: Prisma.PledgeSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the Pledge
     */
    omit?: Prisma.PledgeOmit<ExtArgs> | null;
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: Prisma.PledgeInclude<ExtArgs> | null;
};
