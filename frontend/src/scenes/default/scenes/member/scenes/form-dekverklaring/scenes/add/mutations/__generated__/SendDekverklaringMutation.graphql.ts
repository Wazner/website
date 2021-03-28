/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ConcreteRequest } from "relay-runtime";
export type FailedSendDekverklaringReason = "UNKNOWN" | "%future added value";
export type Studbook = "DRENTS_HEIDESCHAAP" | "SCHOONEBEEKER" | "%future added value";
export type DekverklaringInput = {
    season: number;
    studbook: Studbook;
    name: string;
    kovo: number;
    koe: number;
    kool: number;
    korl: number;
    dekgroepen: Array<DekgroepInput>;
    remarks: string;
};
export type DekgroepInput = {
    ewe_count: number;
    rammen: Array<string>;
};
export type SendDekverklaringMutationVariables = {
    dekverklaring: DekverklaringInput;
};
export type SendDekverklaringMutationResponse = {
    readonly sendDekverklaring: {
        readonly dekverklaring?: {
            readonly id: string;
        } | null;
        readonly reason?: FailedSendDekverklaringReason | null;
    } | null;
};
export type SendDekverklaringMutation = {
    readonly response: SendDekverklaringMutationResponse;
    readonly variables: SendDekverklaringMutationVariables;
};



/*
mutation SendDekverklaringMutation(
  $dekverklaring: DekverklaringInput!
) {
  sendDekverklaring(dekverklaring: $dekverklaring) {
    __typename
    ... on SuccessSendDekverklaringResult {
      dekverklaring {
        id
      }
    }
    ... on FailedSendDekverklaringResult {
      reason
    }
  }
}
*/

const node: ConcreteRequest = (function(){
var v0 = [
  {
    "defaultValue": null,
    "kind": "LocalArgument",
    "name": "dekverklaring"
  }
],
v1 = [
  {
    "kind": "Variable",
    "name": "dekverklaring",
    "variableName": "dekverklaring"
  }
],
v2 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "concreteType": "Dekverklaring",
      "kind": "LinkedField",
      "name": "dekverklaring",
      "plural": false,
      "selections": [
        {
          "alias": null,
          "args": null,
          "kind": "ScalarField",
          "name": "id",
          "storageKey": null
        }
      ],
      "storageKey": null
    }
  ],
  "type": "SuccessSendDekverklaringResult",
  "abstractKey": null
},
v3 = {
  "kind": "InlineFragment",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "reason",
      "storageKey": null
    }
  ],
  "type": "FailedSendDekverklaringResult",
  "abstractKey": null
};
return {
  "fragment": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Fragment",
    "metadata": null,
    "name": "SendDekverklaringMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "sendDekverklaring",
        "plural": false,
        "selections": [
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ],
    "type": "Mutation",
    "abstractKey": null
  },
  "kind": "Request",
  "operation": {
    "argumentDefinitions": (v0/*: any*/),
    "kind": "Operation",
    "name": "SendDekverklaringMutation",
    "selections": [
      {
        "alias": null,
        "args": (v1/*: any*/),
        "concreteType": null,
        "kind": "LinkedField",
        "name": "sendDekverklaring",
        "plural": false,
        "selections": [
          {
            "alias": null,
            "args": null,
            "kind": "ScalarField",
            "name": "__typename",
            "storageKey": null
          },
          (v2/*: any*/),
          (v3/*: any*/)
        ],
        "storageKey": null
      }
    ]
  },
  "params": {
    "cacheID": "42ded0d3981c2998abe6a4f517ebdb87",
    "id": null,
    "metadata": {},
    "name": "SendDekverklaringMutation",
    "operationKind": "mutation",
    "text": "mutation SendDekverklaringMutation(\n  $dekverklaring: DekverklaringInput!\n) {\n  sendDekverklaring(dekverklaring: $dekverklaring) {\n    __typename\n    ... on SuccessSendDekverklaringResult {\n      dekverklaring {\n        id\n      }\n    }\n    ... on FailedSendDekverklaringResult {\n      reason\n    }\n  }\n}\n"
  }
};
})();
(node as any).hash = '3c26ada97f9509042c655a7018bdd551';
export default node;
