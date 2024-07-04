import React from 'react';
import { useNavigate } from 'react-router-dom';
import css from "./search-page.module.css";
import { Checkbox } from "../../components/ui/checkbox/checkbox";
import { Dropdown } from "../../components/ui/dropdown/dropdown";
import { NumericField } from "../../components/ui/numeric-field/numeric-field";
import { RangePicker } from "../../components/ui/range-picker/range-picker";
import { initialData } from "../result-page/use-payload";
import { useImmer } from "use-immer";
import { apiProvider } from "../../api-provider/api-provider";

export function SearchPage() {
    const [payload, updatePayload] = useImmer(initialData);
    const navigate = useNavigate();

    const isDisabled = () => {
        return !payload.searchContext.targetSearchEntitiesContext.targetSearchEntities[0].inn;
    };

    const handleSearch = async () => {
        if (isNaN(payload.searchContext.targetSearchEntitiesContext.targetSearchEntities[0].inn)) {
            console.error("ИНН компании невалиден");
            return;
        }
    
        try {
            console.log("Sending payload:", JSON.stringify(payload, null, 2));  // Логирование отправляемых данных
            const response = await apiProvider.objectsearch.root(payload);
            console.log("response :>> ", response);
            navigate('/result', { state: { searchResults: response } });
        } catch (error) {
            console.error("Error during search:", error);
            navigate('/result', { state: { searchResults: null } });
        }
    };

    const suggestions = [
        { displayText: "Любая", value: "any" },
        { displayText: "Положительная", value: "positive" },
        { displayText: "Отрицательная", value: "negative" },
    ];

    return (
        <div>
            <div className={[css.container, css.bg].join(" ")}>
                <div className={css.root}>
                    <h1 className={css.title}>
                        Найдите необходимые <br /> данные в пару кликов
                    </h1>
                    <h1 className={css.label}>
                        Задайте параметры поиска. <br /> Чем больше заполните, тем точнее поиск
                    </h1>
                    <div>
                        <form className={css.form}>
                            <div>
                                <NumericField
                                    value={payload.searchContext.targetSearchEntitiesContext.targetSearchEntities[0].inn.toString()}
                                    onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                        updatePayload((draft) => {
                                            draft.searchContext.targetSearchEntitiesContext.targetSearchEntities[0].inn =
                                                +ev.target.value;
                                        })
                                    }
                                    required
                                    label="ИНН компании"
                                    placeholder="placeholder"
                                />
                                <label>
                                    <p className={css.label}>Тональность</p>
                                    <div className={css.label}>
                                        <Dropdown
                                            onSelect={(item) => {
                                                updatePayload((draft) => {
                                                    draft.searchContext.targetSearchEntitiesContext.tonality = item;
                                                });
                                            }}
                                            label="Тональность"
                                            suggestions={suggestions}
                                            selectedItem={
                                                suggestions.find(
                                                    (s) =>
                                                        s.value ===
                                                        payload.searchContext.targetSearchEntitiesContext.tonality
                                                )?.displayText ?? "Любая"
                                            }
                                        />
                                    </div>
                                </label>
                                <label>
                                    <p className={css.label}>Количество документов в выдаче</p>
                                    <input
                                        className={css.input}
                                        type="number"
                                        value={payload.limit.toString()}
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                            updatePayload((draft) => {
                                                draft.limit = Number(ev.target.value);
                                            });
                                        }}
                                    />
                                </label>
                                <RangePicker
                                    required
                                    from={new Date(payload.issueDateInterval.startDate)}
                                    to={new Date(payload.issueDateInterval.endDate)}
                                    onChange={(from, to) => {
                                        updatePayload((draft) => {
                                            draft.issueDateInterval.startDate = from?.toISOString() ?? "";
                                            draft.issueDateInterval.endDate = to?.toISOString() ?? "";
                                        });
                                    }}
                                />
                            </div>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <div className={css.checks}>
                                    <Checkbox
                                        label="Признак максимальной полноты"
                                        checked={
                                            payload.searchContext.targetSearchEntitiesContext.targetSearchEntities[0].maxFullness
                                        }
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                            updatePayload((draft) => {
                                                draft.searchContext.targetSearchEntitiesContext.targetSearchEntities[0].maxFullness =
                                                    ev.target.checked;
                                            });
                                        }}
                                    />
                                    <Checkbox
                                        label="Упоминания в бизнес-контексте"
                                        checked={
                                            payload.searchContext.targetSearchEntitiesContext.targetSearchEntities[0]
                                                .inBusinessNews
                                        }
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                            updatePayload((draft) => {
                                                draft.searchContext.targetSearchEntitiesContext.targetSearchEntities[0].inBusinessNews =
                                                    ev.target.checked;
                                            });
                                        }}
                                    />
                                    <Checkbox
                                        label="Главная роль в публикации"
                                        checked={payload.searchContext.targetSearchEntitiesContext.onlyMainRole}
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) => {
                                            updatePayload((draft) => {
                                                draft.searchContext.targetSearchEntitiesContext.onlyMainRole = ev.target.checked;
                                            });
                                        }}
                                    />
                                    <Checkbox
                                        checked={payload.searchContext.targetSearchEntitiesContext.onlyWithRiskFactors}
                                        label="Публикации только с риск-факторами"
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                            updatePayload((draft) => {
                                                draft.searchContext.targetSearchEntitiesContext.onlyWithRiskFactors =
                                                    ev.target.checked;
                                            })
                                        }
                                    />
                                    <Checkbox
                                        checked={!payload.attributeFilters.excludeTechNews}
                                        label="Включать технические новости рынков"
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                            updatePayload((draft) => {
                                                draft.attributeFilters.excludeTechNews = !ev.target.checked;
                                            })
                                        }
                                    />
                                    <Checkbox
                                        checked={!payload.attributeFilters.excludeAnnouncements}
                                        label="Включать анонсы и календари"
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                            updatePayload((draft) => {
                                                draft.attributeFilters.excludeAnnouncements = !ev.target.checked;
                                            })
                                        }
                                    />
                                    <Checkbox
                                        checked={!payload.attributeFilters.excludeDigests}
                                        label="Включать сводки новостей"
                                        onChange={(ev: React.ChangeEvent<HTMLInputElement>) =>
                                            updatePayload((draft) => {
                                                draft.attributeFilters.excludeDigests = !ev.target.checked;
                                            })
                                        }
                                    />
                                </div>
                                <button
                                    className={css.search}
                                    disabled={isDisabled()}
                                    type="button"
                                    onClick={handleSearch}
                                >
                                    Поиск
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
