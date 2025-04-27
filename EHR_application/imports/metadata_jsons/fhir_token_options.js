export const fhir_token_options = {
    "CapabilityStatement": [
        {
            "name": "format",
            "possible_options": [
                "xml",
                "json",
                "ttl",
                "mime-type"
            ]
        },
        {
            "name": "mode",
            "possible_options": [
                "server",
                "client",
                "sender",
                "receiver"
            ]
        },
        {
            "name": "security-service",
            "possible_options": [
                "OAuth",
                "SMART-on-FHIR",
                "NTLM",
                "Basic",
                "Kerberos",
                "Certificates"
            ]
        },
        {
            "name": "status",
            "possible_options": [
                "active",
                "completed",
                "entered-in-error",
                "draft",
                "unknown"
            ]
        }
    ],
    "CareTeam": [
        {
            "name": "status",
            "possible_options": [
                "proposed",
                "active",
                "suspended",
                "inactive",
                "entered-in-error"
            ]
        }
    ],
    "Condition": [
        {
            "name": "clinical-status",
            "possible_options": [
                "active",
                "recurrence",
                "inactive",
                "remission",
                "resolved"
            ]
        },
        {
            "name": "category",
            "possible_options": [
                "problem-list-item",
                "encounter-diagnosis"
            ]
        }
    ],
    "DiagnosticReport": [
        {
            "name": "category",
            "possible_options": [
                "laboratory",
                "vital-signs",
                "imaging",
                "therapy"
            ]
        }
    ],
    "DocumentReference": [
        {
            "name": "status",
            "possible_options": [
                "current",
                "entered-in-error"
            ]
        }
    ],
    "Encounter": [
        {
            "name": "status",
            "possible_options": [
                "in-progress",
                "finished"
            ]
        }
    ],
    "Goal": [
        {
            "name": "lifecycle-status",
            "possible_options": [
                "accepted",
                "active",
                "on-hold"
            ]
        }
    ],
    "Immunization": [
        {
            "name": "status",
            "possible_options": [
                "completed",
                "entered-in-error",
                "not-done"
            ]
        }
    ],
    "MedicationRequest": [
        {
            "name": "intent",
            "possible_options": [
                "proposal",
                "plan",
                "order",
                "original-order",
                "reflex-order",
                "filler-order",
                "instance-order",
                "option"
            ]
        },
        {
            "name": "status",
            "possible_options": [
                "active","on-hold",
                "ended",
                "stopped",
                "completed",
                "cancelled",
                "entered-in-error",
                "draft",
                "unknown"
            ]
        }
    ],
    "Observation": [
        {
            "name": "status",
            "possible_options": [
                "registered",
                "specimen-in-process",
                "preliminary",
                "final",
                "amended",
                "corrected",
                "appended",
                "cancelled",
                "entered-in-error",
                "unknown",
                "cannot-be-obtained"
            ]
        }
    ],
    "Patient": [
        {
            "name": "gender",
            "possible_options": [
                "male",
                "female",
                "other",
                "unknown"
            ]
        }
    ],
    "Practitioner": [
        {
            "name": "gender",
            "possible_options": [
                "male",
                "female",
                "other",
                "unknown"
            ]
        }
    ],
    "Procedure": [
        {
            "name": "status",
            "possible_options": [
                "preparation",
                "in-progress",
                "not-done",
                "on-hold",
                "stopped",
                "completed",
                "entered-in-error",
                "unknown"
            ]
        }
    ]
};

export const RESOURCE_TYPES = [
    "Condition", "Observation", "Procedure", "AllergyIntolerance", "MedicationRequest",
    "Immunization", "Encounter", "DiagnosticReport", "DocumentReference", "CarePlan",
    "Patient", "Practitioner", "CareTeam", "Device", "Coverage", "Appointment"
]; 
