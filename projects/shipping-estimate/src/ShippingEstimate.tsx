import { useEffect, useRef, useState } from 'react';
import {
    Check,
    ChevronDown,
    ChevronUp,
    HelpCircle,
    Info,
    X
} from 'lucide-react';

type EstimateStatus = '未测算' | '测算成功' | '测算失败';

type OrderRow = {
    id: string;
    orderNo: string;
    platformTag?: string;
    store: string;
    product: string;
    sku: string;
    warehouse: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    signature: string;
    invoiceKey: string;
    pickupTime: string;
    status: EstimateStatus;
    channel: string;
    optimal: {
        weight: string;
        length: string;
        width: string;
        height: string;
    };
};

type ChannelCandidate = {
    value: string;
    erpName: string;
    carrierName: string;
    shippingWarehouse: string;
    temuY2SelfShippingName: string;
    actualName: string;
    currency: string;
    fee: string;
    eta: string;
    normalWarehouse: string;
    normalEstimateText: string;
    normalEtaText: string;
    exchangeRate: string;
    group: 'selfAuthorized' | 'platformEnabled' | 'platformAvailable';
    enabled: boolean;
};

type ChannelMenuPosition = {
    top: number;
    left: number;
    width: number;
    maxHeight: number;
};

const channelCandidates: ChannelCandidate[] = [
    {
        value: 'ground-economy-fedex-west',
        erpName: 'ground economyFedEx',
        carrierName: 'TEMU 线上发货',
        shippingWarehouse: '美西仓发货',
        temuY2SelfShippingName: '出口易TEMU-Y2-BFE美西普货',
        actualName: 'ground economyFedEx',
        currency: 'USD',
        fee: '10.34',
        eta: '1-3天',
        normalWarehouse: '谷仓南',
        normalEstimateText: '预估$6.28',
        normalEtaText: '2-6 个工作日送达',
        exchangeRate: '6.7841000',
        group: 'selfAuthorized',
        enabled: true
    },
    {
        value: 'standard-economy-ups-central',
        erpName: 'standard economyUPS',
        carrierName: 'TEMU 线上发货',
        shippingWarehouse: '美中仓发货',
        temuY2SelfShippingName: '出口易TEMU-Y2-BFE美中普货',
        actualName: 'UPS SurePost',
        currency: 'USD',
        fee: '11.28',
        eta: '2-4天',
        normalWarehouse: '谷仓中',
        normalEstimateText: '预估$7.16',
        normalEtaText: '3-6 个工作日送达',
        exchangeRate: '6.7841000',
        group: 'platformEnabled',
        enabled: true
    },
    {
        value: 'economy-packet-dhl-east',
        erpName: 'economy packetDHL',
        carrierName: 'TEMU 线上发货',
        shippingWarehouse: '美东仓发货',
        temuY2SelfShippingName: '出口易TEMU-Y2-BFE美东普货',
        actualName: 'DHL eCommerce Parcel',
        currency: 'USD',
        fee: '12.46',
        eta: '3-5天',
        normalWarehouse: '谷仓东',
        normalEstimateText: '预估$7.88',
        normalEtaText: '4-7 个工作日送达',
        exchangeRate: '6.7841000',
        group: 'platformAvailable',
        enabled: false
    },
    {
        value: 'fedex-home-delivery-west',
        erpName: 'home deliveryFedEx',
        carrierName: 'TEMU 线上发货',
        shippingWarehouse: '美西仓发货',
        temuY2SelfShippingName: '出口易TEMU-Y2-BFE美西带电',
        actualName: 'FedEx Home Delivery',
        currency: 'USD',
        fee: '10.98',
        eta: '2-4天',
        normalWarehouse: '谷仓南',
        normalEstimateText: '预估$6.78',
        normalEtaText: '3-6 个工作日送达',
        exchangeRate: '6.7841000',
        group: 'selfAuthorized',
        enabled: false
    },
    {
        value: 'ups-ground-east',
        erpName: 'ground standardUPS',
        carrierName: 'TEMU 线上发货',
        shippingWarehouse: '美东仓发货',
        temuY2SelfShippingName: '出口易TEMU-Y2-BFE美东大件',
        actualName: 'UPS Ground',
        currency: 'USD',
        fee: '12.46',
        eta: '2-5天',
        normalWarehouse: '谷仓东',
        normalEstimateText: '预估$7.88',
        normalEtaText: '3-7 个工作日送达',
        exchangeRate: '6.7841000',
        group: 'platformAvailable',
        enabled: false
    },
    {
        value: 'usps-priority-central',
        erpName: 'priority mailUSPS',
        carrierName: 'TEMU 线上发货',
        shippingWarehouse: '美中仓发货',
        temuY2SelfShippingName: '出口易TEMU-Y2-BFE美中优先',
        actualName: 'USPS Priority Mail',
        currency: 'USD',
        fee: '15.20',
        eta: '1-3天',
        normalWarehouse: '谷仓中',
        normalEstimateText: '预估$9.52',
        normalEtaText: '2-5 个工作日送达',
        exchangeRate: '6.7841000',
        group: 'platformEnabled',
        enabled: false
    },
    {
        value: 'dhl-ground-plus-west',
        erpName: 'ground plusDHL',
        carrierName: 'TEMU 线上发货',
        shippingWarehouse: '美西仓发货',
        temuY2SelfShippingName: '出口易TEMU-Y2-BFE美西特货',
        actualName: 'DHL Ground Plus',
        currency: 'USD',
        fee: '13.78',
        eta: '4-6天',
        normalWarehouse: '谷仓南',
        normalEstimateText: '预估$8.68',
        normalEtaText: '5-8 个工作日送达',
        exchangeRate: '6.7841000',
        group: 'platformAvailable',
        enabled: false
    }
];

const initialOrders: OrderRow[] = [
    {
        id: 'order-001',
        orderNo: 'SA2604300006',
        store: 'TEMU-US',
        product: 'Ceramic filter set / AB001-1',
        sku: 'AB001-1',
        warehouse: 'TEMU Dallas WH',
        weight: '1000',
        length: '20',
        width: '15',
        height: '8',
        signature: 'no-sign',
        invoiceKey: 'INV-94024',
        pickupTime: '2026-07-03 09:30',
        status: '未测算',
        channel: '',
        optimal: { weight: '920', length: '18', width: '14', height: '8' }
    },
    {
        id: 'order-002',
        orderNo: 'SA2604300007',
        store: 'TEMU-US',
        product: 'Coffee grinder bundle / CG5120',
        sku: 'CG5120',
        warehouse: 'TEMU Los Angeles WH',
        weight: '1350',
        length: '24',
        width: '18',
        height: '12',
        signature: 'no-sign',
        invoiceKey: 'INV-94025',
        pickupTime: '2026-07-03 10:00',
        status: '未测算',
        channel: '',
        optimal: { weight: '1280', length: '22', width: '17', height: '11' }
    },
    {
        id: 'order-003',
        orderNo: 'SA2604300014',
        store: 'TEMU-US',
        product: 'Kitchen storage rack / KS3302',
        sku: 'KS3302',
        warehouse: 'TEMU New Jersey WH',
        weight: '1100',
        length: '30',
        width: '10',
        height: '10',
        signature: 'sign',
        invoiceKey: 'INV-94039',
        pickupTime: '2026-07-03 10:30',
        status: '未测算',
        channel: '',
        optimal: { weight: '1050', length: '28', width: '10', height: '9' }
    },
    {
        id: 'order-004',
        orderNo: 'SA2604300021',
        platformTag: '【TEMU Y2】',
        store: 'TEMU-US',
        product: 'Silicone utensil holder / SU2048',
        sku: 'SU2048',
        warehouse: 'TEMU California WH',
        weight: '860',
        length: '18',
        width: '12',
        height: '10',
        signature: 'no-sign',
        invoiceKey: 'INV-94051',
        pickupTime: '2026-07-03 11:00',
        status: '未测算',
        channel: '',
        optimal: { weight: '820', length: '17', width: '12', height: '9' }
    },
    {
        id: 'order-005',
        orderNo: 'SA2604300028',
        platformTag: '【TEMU Y2】',
        store: 'TEMU-US',
        product: 'Bamboo drawer organizer / BD7780',
        sku: 'BD7780',
        warehouse: 'TEMU Chicago WH',
        weight: '1680',
        length: '32',
        width: '22',
        height: '6',
        signature: 'no-sign',
        invoiceKey: 'INV-94062',
        pickupTime: '2026-07-03 11:30',
        status: '未测算',
        channel: '',
        optimal: { weight: '1600', length: '30', width: '21', height: '6' }
    },
    {
        id: 'order-006',
        orderNo: 'SA2604300033',
        platformTag: '【TEMU Y2】',
        store: 'TEMU-US',
        product: 'Stainless measuring cup set / MC4410',
        sku: 'MC4410',
        warehouse: 'TEMU Atlanta WH',
        weight: '740',
        length: '16',
        width: '14',
        height: '9',
        signature: 'sign',
        invoiceKey: 'INV-94073',
        pickupTime: '2026-07-03 12:00',
        status: '未测算',
        channel: '',
        optimal: { weight: '700', length: '15', width: '13', height: '8' }
    }
];

const signatureOptions = [
    { value: 'no-sign', label: '不签名' },
    { value: 'sign', label: '签名' }
];

const pickupTimeOptions = [
    '2026-07-03 09:30',
    '2026-07-03 10:00',
    '2026-07-03 10:30',
    '2026-07-03 11:00',
    '2026-07-03 11:30',
    '2026-07-03 12:00',
    '2026-07-03 14:00',
    '2026-07-03 16:00'
];

const footerNotice = '以当前填列的履约仓库、订单重量、订单体积上传平台。';

function parseEtaStartDays(eta: string) {
    return Number.parseInt(eta, 10) || Number.MAX_SAFE_INTEGER;
}

function sortChannelsByEstimate(channelList: ChannelCandidate[]) {
    return [...channelList].sort((left, right) => {
        const feeDiff = Number.parseFloat(left.fee) - Number.parseFloat(right.fee);
        if (feeDiff !== 0) {
            return feeDiff;
        }

        return parseEtaStartDays(left.eta) - parseEtaStartDays(right.eta);
    });
}

export default function ShippingEstimate() {
    const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);
    const [orders, setOrders] = useState<OrderRow[]>(initialOrders);
    const [selectedIds, setSelectedIds] = useState<string[]>(initialOrders.map((order) => order.id));
    const [batchWeight, setBatchWeight] = useState('1000');
    const [batchLength, setBatchLength] = useState('20');
    const [batchWidth, setBatchWidth] = useState('15');
    const [batchHeight, setBatchHeight] = useState('8');
    const [batchSignature, setBatchSignature] = useState('no-sign');
    const [historyItems, setHistoryItems] = useState<string[]>(['重量 1000g, 长 10cm, 宽 10cm, 高 10cm']);
    const [openChannelOrderId, setOpenChannelOrderId] = useState<string | null>(null);
    const [channelMenuPosition, setChannelMenuPosition] = useState<ChannelMenuPosition | null>(null);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const channelMenuRef = useRef<HTMLDivElement>(null);

    const allSelected = selectedIds.length === orders.length && orders.length > 0;
    const partiallySelected = selectedIds.length > 0 && selectedIds.length < orders.length;
    const measuredSelectedCount = selectedIds.filter((id) => orders.find((order) => order.id === id)?.status === '测算成功').length;
    const normalEnabledChannels = sortChannelsByEstimate(channelCandidates.filter((candidate) => candidate.enabled));
    const normalDisabledChannels = sortChannelsByEstimate(channelCandidates.filter((candidate) => !candidate.enabled));
    const temuY2SelfAuthorizedChannels = sortChannelsByEstimate(channelCandidates.filter((candidate) => candidate.group === 'selfAuthorized'));
    const temuY2PlatformEnabledChannels = sortChannelsByEstimate(channelCandidates.filter((candidate) => candidate.group === 'platformEnabled'));
    const temuY2PlatformAvailableChannels = sortChannelsByEstimate(channelCandidates.filter((candidate) => candidate.group === 'platformAvailable'));

    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = partiallySelected;
        }
    }, [partiallySelected]);

    useEffect(() => {
        if (!openChannelOrderId) {
            return;
        }

        function handleScroll(event: Event) {
            const target = event.target;
            if (target instanceof Node && channelMenuRef.current?.contains(target)) {
                return;
            }

            closeChannelMenu();
        }

        window.addEventListener('resize', closeChannelMenu);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            window.removeEventListener('resize', closeChannelMenu);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [openChannelOrderId]);

    function showNotice(_message: string) {
    }

    function isTemuY2Order(order?: OrderRow) {
        return order?.platformTag === '【TEMU Y2】';
    }

    function shouldUseTemuY2SelfShippingCopy(channel: ChannelCandidate, order?: OrderRow) {
        return isTemuY2Order(order) && channel.group === 'selfAuthorized';
    }

    function formatChannelMain(channel: ChannelCandidate, order?: OrderRow) {
        if (shouldUseTemuY2SelfShippingCopy(channel, order)) {
            return channel.temuY2SelfShippingName;
        }

        return `${channel.erpName}【${channel.carrierName}】`;
    }

    function formatChannelInfo(channel: ChannelCandidate, order?: OrderRow) {
        if (shouldUseTemuY2SelfShippingCopy(channel, order)) {
            return `${channel.actualName} / ${channel.currency} ${channel.fee} / ${channel.eta}`;
        }

        return `${channel.normalWarehouse};${channel.normalEstimateText}; ${channel.normalEtaText};当前计算汇率：${channel.currency}:${channel.exchangeRate}`;
    }

    function getDefaultChannelForOrder(order: OrderRow) {
        if (isTemuY2Order(order)) {
            return temuY2SelfAuthorizedChannels[0] ?? temuY2PlatformEnabledChannels[0] ?? temuY2PlatformAvailableChannels[0];
        }

        return normalEnabledChannels[0] ?? normalDisabledChannels[0];
    }

    function toggleOrder(orderId: string, checked: boolean) {
        setSelectedIds((current) =>
            checked ? Array.from(new Set([...current, orderId])) : current.filter((id) => id !== orderId)
        );
    }

    function toggleAll(checked: boolean) {
        setSelectedIds(checked ? orders.map((order) => order.id) : []);
    }

    function updateOrder(orderId: string, patch: Partial<OrderRow>) {
        setOrders((current) =>
            current.map((order) =>
                order.id === orderId
                    ? {
                        ...order,
                        ...patch,
                        status: patch.status ?? order.status
                    }
                    : order
            )
        );
        if (patch.channel !== undefined) {
            closeChannelMenu();
        }
    }

    function closeChannelMenu() {
        setOpenChannelOrderId(null);
        setChannelMenuPosition(null);
    }

    function toggleChannelMenu(orderId: string, trigger: HTMLButtonElement) {
        if (openChannelOrderId === orderId) {
            closeChannelMenu();
            return;
        }

        const rect = trigger.getBoundingClientRect();
        const viewportGap = 12;
        const menuOffset = 4;
        const spaceBelow = window.innerHeight - rect.bottom - viewportGap;
        const spaceAbove = rect.top - viewportGap;
        const shouldOpenUp = spaceBelow < 240 && spaceAbove > spaceBelow;
        const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow;
        const maxHeight = Math.max(120, Math.min(420, availableSpace));

        setChannelMenuPosition({
            top: shouldOpenUp ? Math.max(viewportGap, rect.top - maxHeight - menuOffset) : rect.bottom + menuOffset,
            left: rect.left,
            width: rect.width,
            maxHeight
        });
        setOpenChannelOrderId(orderId);
    }

    function getBatchTargetIds() {
        return selectedIds.length > 0 ? selectedIds : orders.map((order) => order.id);
    }

    function updateBatchOrders(targetIds: string[], patch: Partial<OrderRow>) {
        setOrders((current) =>
            current.map((order) => (targetIds.includes(order.id) ? { ...order, ...patch } : order))
        );
    }

    function batchFill() {
        const targetIds = getBatchTargetIds();

        updateBatchOrders(targetIds, {
            weight: batchWeight,
            length: batchLength,
            width: batchWidth,
            height: batchHeight,
            signature: batchSignature,
            status: '未测算',
            channel: ''
        });
        setHistoryItems((current) => [
            `重量 ${batchWeight}g, 长 ${batchLength}cm, 宽 ${batchWidth}cm, 高 ${batchHeight}cm`,
            ...current.slice(0, 2)
        ]);
        showNotice(`已批量填充 ${targetIds.length} 单，测算结果已重置。`);
    }

    function batchClear() {
        const targetIds = getBatchTargetIds();

        updateBatchOrders(targetIds, {
            weight: '',
            length: '',
            width: '',
            height: '',
            signature: 'no-sign',
            status: '未测算',
            channel: ''
        });
        showNotice(`已清除 ${targetIds.length} 单的重量、尺寸和测算渠道。`);
    }

    function applyOptimalValues() {
        if (selectedIds.length === 0) {
            showNotice('请选择需要应用最优长宽高、订单重量的订单。');
            return;
        }

        setOrders((current) =>
            current.map((order) =>
                selectedIds.includes(order.id)
                    ? {
                        ...order,
                        weight: order.optimal.weight,
                        length: order.optimal.length,
                        width: order.optimal.width,
                        height: order.optimal.height,
                        status: '未测算',
                        channel: ''
                    }
                    : order
            )
        );
        showNotice(`已为 ${selectedIds.length} 单应用系统推荐重量和尺寸，需重新测算。`);
    }

    function measureSelectedOrders() {
        if (selectedIds.length === 0) {
            showNotice('请选择需要测算的订单。');
            return;
        }

        const missingOrder = orders.find((order) =>
            selectedIds.includes(order.id) && (!order.weight || !order.length || !order.width || !order.height)
        );

        if (missingOrder) {
            showNotice(`订单 ${missingOrder.orderNo} 缺少重量或尺寸，请补充后再测算。`);
            return;
        }

        setOrders((current) =>
            current.map((order) =>
                selectedIds.includes(order.id)
                    ? { ...order, status: '测算成功', channel: getDefaultChannelForOrder(order)?.value ?? '' }
                    : order
            )
        );
        showNotice(`测算完成：成功 ${selectedIds.length} 单，已默认填入最低预估费用渠道。`);
    }

    function confirmChannels() {
        if (selectedIds.length === 0) {
            showNotice('请选择需要确认渠道的订单。');
            return;
        }

        if (measuredSelectedCount === 0) {
            showNotice('请先测算并选择物流渠道及费用。');
            return;
        }

        showNotice(`已确认 ${measuredSelectedCount} 单渠道，提交时将使用当前行最终选中的渠道。`);
    }

    function deleteOrder(orderId: string) {
        setOrders((current) => current.filter((order) => order.id !== orderId));
        setSelectedIds((current) => current.filter((id) => id !== orderId));
        showNotice('已删除该订单。');
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex items-center justify-center font-sans text-sm text-gray-800">
            <div className="bg-white w-full max-w-7xl rounded-md shadow-lg border border-gray-200 flex flex-col h-[85vh]">
                <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                    <div>
                        <h2 className="text-base font-bold text-gray-900">渠道运费预估</h2>
                        <p className="text-xs text-gray-500 mt-0.5">已补充批量填充、运费测算、渠道改选和确认闭环</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 focus:outline-none" aria-label="关闭">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-auto bg-[#fafafa]">
                    <div className="bg-white px-4 py-3 flex flex-wrap items-center gap-4 border-b border-gray-200 shadow-sm">
                        <div className="flex items-center gap-2">
                            <label className="whitespace-nowrap text-gray-700" htmlFor="batch-weight">发货重量</label>
                            <input
                                id="batch-weight"
                                type="text"
                                value={batchWeight}
                                onChange={(event) => setBatchWeight(event.target.value)}
                                className="w-20 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            />
                            <span className="text-xs text-gray-400">g</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="whitespace-nowrap text-gray-700">尺寸信息</span>
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={batchLength}
                                    onChange={(event) => setBatchLength(event.target.value)}
                                    placeholder="长"
                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
                                />
                                <input
                                    type="text"
                                    value={batchWidth}
                                    onChange={(event) => setBatchWidth(event.target.value)}
                                    placeholder="宽"
                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
                                />
                                <input
                                    type="text"
                                    value={batchHeight}
                                    onChange={(event) => setBatchHeight(event.target.value)}
                                    placeholder="高"
                                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-400"
                                />
                                <span className="text-xs text-gray-400">cm</span>
                            </div>
                        </div>

                        <select
                            value={batchSignature}
                            onChange={(event) => setBatchSignature(event.target.value)}
                            className="w-32 border border-gray-300 rounded px-2 py-1 bg-white text-gray-700 text-sm focus:outline-none focus:border-blue-500"
                            aria-label="签名服务"
                        >
                            {signatureOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={batchFill}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                            >
                                批量填充
                            </button>
                            <button
                                onClick={batchClear}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors"
                            >
                                批量清除
                            </button>
                            <button
                                onClick={applyOptimalValues}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1 rounded text-sm font-medium transition-colors flex items-center gap-1"
                            >
                                批量应用最优长宽高、订单重量到勾选订单
                                <HelpCircle size={14} className="text-white opacity-80"/>
                            </button>
                        </div>

                        <a href="#" className="text-orange-500 hover:underline text-sm ml-2">帮助文档</a>
                    </div>

                    <div className="bg-[#fafafa] px-4 py-2 border-b border-gray-200 flex justify-between items-center gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-gray-700 shrink-0">批量填充历史</span>
                            {isHistoryExpanded ? (
                                <div className="flex items-center gap-1 overflow-hidden">
                                    {historyItems.map((item, index) => (
                                        <div key={`${item}-${index}`} className="flex items-center gap-1 bg-gray-100 border border-gray-200 rounded px-2 py-0.5 text-xs text-gray-500 whitespace-nowrap">
                                            {item}
                                            <button
                                                onClick={() => setHistoryItems((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                                                className="ml-1 hover:text-gray-700"
                                                aria-label={`删除历史 ${item}`}
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : null}
                        </div>

                        <button
                            className="text-orange-500 flex items-center gap-1 text-xs hover:text-orange-600 shrink-0"
                            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
                        >
                            {isHistoryExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {isHistoryExpanded ? '收起' : '展开'}
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1120px] text-left border-collapse">
                            <thead className="bg-[#f5f5f5] text-gray-600 text-xs uppercase border-b border-gray-200">
                                <tr>
                                    <th className="sticky left-0 z-20 bg-[#f5f5f5] p-3 w-10 min-w-[40px] text-center border-r border-gray-200">
                                        <input
                                            ref={headerCheckboxRef}
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={(event) => toggleAll(event.target.checked)}
                                            aria-label="选择全部订单"
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="sticky left-10 z-20 bg-[#f5f5f5] p-3 border-r border-gray-200 font-medium whitespace-nowrap min-w-[120px] shadow-[4px_0_8px_rgba(15,23,42,0.06)]">订单编号</th>
                                    <th className="p-3 border-r border-gray-200 font-medium whitespace-nowrap min-w-[100px]">店铺</th>
                                    <th className="p-3 border-r border-gray-200 font-medium whitespace-nowrap min-w-[320px]">商品</th>
                                    <th className="p-3 border-r border-gray-200 font-medium whitespace-nowrap min-w-[110px]">重量</th>
                                    <th className="p-3 border-r border-gray-200 font-medium whitespace-nowrap min-w-[120px]">签名服务</th>
                                    <th className="p-3 border-r border-gray-200 font-medium whitespace-nowrap min-w-[190px]">体积信息</th>
                                    <th className="p-3 border-r border-gray-200 font-medium whitespace-nowrap min-w-[120px]">
                                        <div className="flex items-center gap-1">
                                            发票密钥 <Info size={14} className="text-gray-400" />
                                        </div>
                                    </th>
                                    <th className="p-3 border-r border-gray-200 font-medium whitespace-nowrap min-w-[160px]">搅收时间</th>
                                    <th className="sticky right-20 z-10 bg-[#f5f5f5] p-3 border-r border-l border-gray-200 font-medium whitespace-nowrap min-w-[280px] shadow-[-4px_0_8px_rgba(15,23,42,0.06)]">
                                        <div className="flex items-center gap-5">
                                            <span>物流渠道及费用</span>
                                            <button
                                                onClick={measureSelectedOrders}
                                                className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-0.5 rounded text-xs"
                                            >
                                                测算
                                            </button>
                                        </div>
                                    </th>
                                    <th className="sticky right-0 z-10 bg-[#f5f5f5] p-3 font-medium whitespace-nowrap w-20 min-w-[80px] text-center">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const selectedChannel = channelCandidates.find((candidate) => candidate.value === order.channel);
                                    const channelDisabled = order.status !== '测算成功';
                                    const channelGroups = isTemuY2Order(order)
                                        ? [
                                            {
                                                title: '自发货物流授权',
                                                channels: temuY2SelfAuthorizedChannels,
                                                selectable: true,
                                                muted: false
                                            },
                                            {
                                                title: '平台物流已启用',
                                                channels: temuY2PlatformEnabledChannels,
                                                selectable: true,
                                                muted: false
                                            },
                                            {
                                                title: '平台物流未启用',
                                                channels: temuY2PlatformAvailableChannels,
                                                selectable: false,
                                                muted: true
                                            }
                                        ]
                                        : [
                                            {
                                                title: '物流授权已启用渠道',
                                                channels: normalEnabledChannels,
                                                selectable: true,
                                                muted: false
                                            },
                                            {
                                                title: '未启用渠道',
                                                channels: normalDisabledChannels,
                                                selectable: false,
                                                muted: true
                                            }
                                        ];

                                    return (
                                        <tr key={order.id} className="bg-white border-b border-gray-100 hover:bg-orange-50/30">
                                            <td className="sticky left-0 z-10 bg-white p-3 text-center border-r border-gray-100 align-top">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.includes(order.id)}
                                                    onChange={(event) => toggleOrder(order.id, event.target.checked)}
                                                    aria-label={`选择订单 ${order.orderNo}`}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </td>
                                            <td className="sticky left-10 z-10 bg-white p-3 border-r border-gray-100 align-top shadow-[4px_0_8px_rgba(15,23,42,0.04)]">
                                                <div className="flex flex-wrap items-center gap-1.5 font-medium text-gray-900">
                                                    <span>{order.orderNo}</span>
                                                    {order.platformTag ? (
                                                        <span className="text-xs font-medium text-orange-600">{order.platformTag}</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-100 align-top text-gray-700">{order.store}</td>
                                            <td className="p-3 border-r border-gray-100 align-top">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 shrink-0 rounded border border-gray-200 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400">
                                                        {order.sku.slice(0, 2)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-gray-800">{order.product}</div>
                                                        <div className="text-xs text-gray-400 mt-1">SKU {order.sku} / 数量 1</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-100 align-top">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="text"
                                                        value={order.weight}
                                                        onChange={(event) => updateOrder(order.id, { weight: event.target.value, channel: '', status: '未测算' })}
                                                        className="w-16 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                    />
                                                    <span className="text-xs text-gray-400">g</span>
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-100 align-top">
                                                <select
                                                    value={order.signature}
                                                    onChange={(event) => updateOrder(order.id, { signature: event.target.value, channel: '', status: '未测算' })}
                                                    className="w-24 border border-gray-300 rounded px-2 py-1 bg-white text-sm focus:outline-none focus:border-blue-500"
                                                >
                                                    {signatureOptions.map((option) => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="p-3 border-r border-gray-100 align-top">
                                                <div className="flex items-center gap-1">
                                                    <input
                                                        type="text"
                                                        value={order.length}
                                                        onChange={(event) => updateOrder(order.id, { length: event.target.value, channel: '', status: '未测算' })}
                                                        placeholder="长"
                                                        className="w-12 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={order.width}
                                                        onChange={(event) => updateOrder(order.id, { width: event.target.value, channel: '', status: '未测算' })}
                                                        placeholder="宽"
                                                        className="w-12 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={order.height}
                                                        onChange={(event) => updateOrder(order.id, { height: event.target.value, channel: '', status: '未测算' })}
                                                        placeholder="高"
                                                        className="w-12 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
                                                    />
                                                    <span className="text-xs text-gray-400">cm</span>
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-100 align-top">
                                                <input
                                                    type="text"
                                                    value={order.invoiceKey}
                                                    onChange={(event) => updateOrder(order.id, { invoiceKey: event.target.value })}
                                                    className="w-28 border border-gray-300 rounded px-2 py-1 text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                                                    aria-label={`填写订单 ${order.orderNo} 的发票密钥`}
                                                />
                                            </td>
                                            <td className="p-3 border-r border-gray-100 align-top">
                                                <select
                                                    value={order.pickupTime}
                                                    onChange={(event) => updateOrder(order.id, { pickupTime: event.target.value })}
                                                    className="w-36 border border-gray-300 rounded px-2 py-1 bg-white text-sm text-gray-700 focus:outline-none focus:border-blue-500"
                                                    aria-label={`选择订单 ${order.orderNo} 的搅收时间`}
                                                >
                                                    {pickupTimeOptions.map((option) => (
                                                        <option key={option} value={option}>{option}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className={`sticky right-20 bg-white p-3 border-r border-l border-gray-100 align-top shadow-[-4px_0_8px_rgba(15,23,42,0.04)] ${openChannelOrderId === order.id ? 'z-40' : 'z-10'}`}>
                                                <div className="relative">
                                                    <button
                                                        type="button"
                                                        disabled={channelDisabled}
                                                        onMouseDown={(event) => event.preventDefault()}
                                                        onClick={(event) => toggleChannelMenu(order.id, event.currentTarget)}
                                                        className={`w-full border rounded px-3 py-2 text-left focus:outline-none focus:border-blue-500 ${channelDisabled ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-gray-300 text-gray-800 bg-white'}`}
                                                        aria-haspopup="listbox"
                                                        aria-expanded={openChannelOrderId === order.id}
                                                        aria-label={`选择订单 ${order.orderNo} 的物流渠道及费用`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <div className="truncate text-sm">
                                                                    {selectedChannel ? formatChannelMain(selectedChannel, order) : channelDisabled ? '点击测算后选择' : '请选择渠道'}
                                                                </div>
                                                                <div className="mt-1 text-xs text-gray-400">
                                                                    {selectedChannel ? formatChannelInfo(selectedChannel, order) : '未测算前不可选择渠道'}
                                                                </div>
                                                            </div>
                                                            <ChevronDown size={14} className="mt-1 shrink-0 text-gray-400" />
                                                        </div>
                                                    </button>

                                                    {!channelDisabled && openChannelOrderId === order.id && channelMenuPosition ? (
                                                        <div
                                                            ref={channelMenuRef}
                                                            className="fixed z-50 overflow-y-auto rounded border border-gray-200 bg-white shadow-lg"
                                                            role="listbox"
                                                            style={{
                                                                top: channelMenuPosition.top,
                                                                left: channelMenuPosition.left,
                                                                width: channelMenuPosition.width,
                                                                maxHeight: channelMenuPosition.maxHeight
                                                            }}
                                                        >
                                                            {channelGroups.map((group) => (
                                                                <div key={group.title}>
                                                                    <div className="border-y border-gray-100 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 first:border-t-0">
                                                                        {group.title}
                                                                    </div>
                                                                    {group.channels.map((candidate) => (
                                                                        <button
                                                                            key={candidate.value}
                                                                            type="button"
                                                                            className={`w-full px-3 py-2 text-left focus:outline-none ${group.selectable ? 'hover:bg-orange-50 focus:bg-orange-50' : 'cursor-not-allowed text-gray-400'}`}
                                                                            disabled={!group.selectable}
                                                                            onClick={() => {
                                                                                if (group.selectable) {
                                                                                    updateOrder(order.id, { channel: candidate.value, status: '测算成功' });
                                                                                }
                                                                            }}
                                                                            role="option"
                                                                            aria-disabled={!group.selectable}
                                                                            aria-selected={candidate.value === order.channel}
                                                                        >
                                                                            <div className={`truncate text-sm ${group.muted ? '' : 'text-gray-900'}`}>{formatChannelMain(candidate, order)}</div>
                                                                            <div className="mt-1 text-xs text-gray-400">
                                                                                {formatChannelInfo(candidate, order)}
                                                                            </div>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="sticky right-0 z-10 bg-white p-3 text-center align-top w-20 min-w-[80px]">
                                                <button
                                                    onClick={() => deleteOrder(order.id)}
                                                    className="text-orange-500 hover:text-orange-600 text-xs"
                                                >
                                                    删除
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        <div className="h-1 bg-gray-200 w-full rounded-full mt-1 max-w-[95%] mx-auto opacity-50"></div>
                    </div>
                </div>

                <div className="bg-[#fff8f0] px-4 py-3 flex justify-between items-center border-t border-orange-200 rounded-b-md shrink-0">
                    <div className="flex items-center gap-4 text-xs overflow-hidden pr-4">
                        <div className="flex items-center gap-1 text-gray-700 whitespace-nowrap">
                            <div className="bg-orange-500 rounded-sm p-[1px] flex items-center justify-center">
                                <Check size={12} className="text-white stroke-[3]"/>
                            </div>
                            <span>{footerNotice}</span>
                            <Info size={14} className="text-gray-400 cursor-help shrink-0" />
                        </div>
                        <span className="text-orange-500 truncate">
                            平台测算运费订单，每秒支持获取10条运费测算数据(平台限制)，请勿单次运行太多测算数据！
                        </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            onClick={confirmChannels}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-1.5 rounded text-sm font-medium transition-colors whitespace-nowrap"
                        >
                            确认选用渠道
                        </button>
                        <button
                            onClick={() => showNotice('已取消本次渠道选用。')}
                            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-1.5 rounded text-sm transition-colors whitespace-nowrap"
                        >
                            取消
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
