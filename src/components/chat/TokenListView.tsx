import React from "react";

interface TokenListViewProps {
  tokens: string[];
}

export const TokenListView: React.FC<TokenListViewProps> = ({ tokens }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Token Sequence</h3>
      <ol className="list-decimal list-inside bg-gray-50 p-4 rounded-md space-y-2">
        {tokens.map((token, index) => (
          <li
            key={index}
            className="font-mono text-blue-800 bg-blue-50 rounded px-2 py-1"
          >
            <span className="text-gray-500 mr-4">{index}:</span>
            {token}
          </li>
        ))}
      </ol>
    </div>
  );
};
