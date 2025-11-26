export interface network_event {
  eth: {
    ethertype: number;
    dest: Uint8Array;
    dest_s: string;
    src: Uint8Array;
    src_s: string;
  };
  ipv4?: {
    proto: number;
    src: [number, number, number, number];
    dest: [number, number, number, number];
    // Additional IPv4 fields would go here
  };
  tcp?: {
    syn: boolean;
    fin: boolean;
    ack: boolean;
    rst: boolean;
    sport: number;
    dport: number;
    seq: number;
    ackn: number;
    winsize: number;
  };
  udp?: {
    sport: number;
    dport: number;
    data?: Uint8Array;
  };
  dns?: {
    id: number;
    flags: number;
    questions: Array<{
      name: string;
      type: number;
      class: number;
    }>;
    answers?: Array<{
      name: string;
      type: number;
      class: number;
      ttl: number;
      data: number[];
    }>;
  };
  dhcp?: {
    htype: number;
    hlen: number;
    hops: number;
    xid: number;
    secs: number;
    flags: number;
    ciaddr: number;
    yiaddr: number;
    siaddr: number;
    giaddr: number;
    chaddr: Uint8Array;
    op: number;
    options?: Uint8Array[];
  };
  ntp?: {
    flags: number;
    poll: number;
    ori_ts_i: number;
    ori_ts_f: number;
    rec_ts_i: number;
    rec_ts_f: number;
    trans_ts_i: number;
    trans_ts_f: number;
    stratum: number;
  };
  icmp?: {
    type: number;
    // Additional ICMP fields would go here
  };
  arp?: {
    oper: number;
    ptype: number;
    // Additional ARP fields would go here
  };
}
