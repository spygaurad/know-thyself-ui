import React from "react";

interface AttentionGridViewProps {
  tokens: string[];
  attention: number[][];
}

export const AttentionGridView: React.FC<AttentionGridViewProps> = ({
  tokens,
  attention,
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Attention Matrix</h3>
      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 border-r border-b font-semibold">Token</th>
              {tokens.map((token, index) => (
                <th
                  key={index}
                  className="p-2 border-b text-center font-semibold truncate"
                  title={token}
                >
                  {index}: {token}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {attention.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-blue-50">
                <th
                  className="p-2 border-r bg-gray-50 sticky left-0 font-semibold truncate"
                  title={tokens[rowIndex]}
                >
                  {rowIndex}: {tokens[rowIndex]}
                </th>
                {row.map((score, colIndex) => (
                  <td
                    key={colIndex}
                    className="p-2 font-mono text-center"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${score})` }}
                  >
                    <span
                      className={`px-1 rounded ${
                        score > 0.5 ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {score.toFixed(3)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
